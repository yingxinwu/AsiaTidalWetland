var covariateLibrary = ee.FeatureCollection("projects/ee-wyx10/assets/CovariateSet/TrainSet_Pre1");
var Buffer = ee.Image("projects/ee-wyx10/assets/PredictorSetNew/B12"),
    Extent = ee.Image("projects/ee-wyx10/assets/EXTENT/EXTENT_12_49"),
    Site = ee.FeatureCollection("projects/ee-wyx10/assets/Site/Patch_P_1_2_49");
var simpleCoastLine = ee.FeatureCollection('projects/UQ_intertidal/dataMasks/simpleNaturalEarthCoastline_v1').first().geometry();
var site = Site.geometry();
var dataMask = ee.Image('projects/UQ_intertidal/dataMasks/topyBathyEcoMask_300m_v2_0_3');  // sets mapping area
var startDate = '2022-01-01';
var endDate = '2022-12-31';
var bandSelect = ['green', 'swir1', 'swir2', 'nir', 'red', 'blue'];
var bandsS = ['B3', 'B11', 'B12', 'B8', 'B4','B2'];

var parallelScale = 8;
//var mask1=ee.Image('projects/ee-wyx10/assets/china_mask');


var mappingFunctions = { 
  
  applyPixelQAcloudMask: function (image) {
    // Mask out shadow, snow, and cloud using image qa layer. 
    var qa = image.select('pixel_qa');
    var mask = image.updateMask(
      qa.bitwiseAnd(1 << 3).eq(0)       // Cloud shadow bit
      .and(qa.bitwiseAnd(1 << 4).eq(0)) // Snow bit
      .and(qa.bitwiseAnd(1 << 5).eq(0))); // Cloud bit;
    return mask;
  },
  maskS2clouds: function(image) {
    var qa = image.select('QA60');
    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
    return image.updateMask(mask).divide(10000);
  },
  applyCoastMask: function (image) {
    // apply coastal data mask to image
    var im = image.updateMask(dataMask);
    return im;
  },
  
  applyNDWI: function(image) {
    // apply NDWI to image
    var ndwi = image.normalizedDifference(['green','nir']);
    return ndwi.select([0], ['ndw']);
  },
  
  applyMNDWI: function(image) {
    // apply MNDWI to image
    var mndwi = image.normalizedDifference(["green","swir1"]);
    return mndwi.select([0], ['mnd']);
  },
  
  applyAWEI: function(image) {
    // apply AWEI to image
    var awei = image.expression("awe = 4*(b('green')-b('swir1'))-(0.25*b('nir')+2.75*b('swir2'))");
    return awei;
  }, 
  
  applyNDVI: function(image) {
    // apply NDVI to image
    var ndvi = image.normalizedDifference(['nir','red']);
    return ndvi.select([0], ['ndv']);
  }, 
  
  applyEVI: function(image) {
    //apply EVI to image
    var evi = image.expression("evi = 2.5*(b('nir')-b('red'))/(b('nir')+6*b('red') - 7.5*b('blue') + 1)");
    return evi;
  },
  
  applyEMVI: function(image) {
    //apply EMVI to image
    var emvi = image.expression("emvi = (b('green')-b('swir2'))/(b('swir1')-b('green'))");
    return emvi;
  },
  
  applyMVI: function(image) {
    //apply MVI to image
    var mvi = image.expression("mvi = (b('nir')-b('green'))/(b('swir1')-b('green'))");
    return mvi;
  }
  
  
};

var reducer = ee.Reducer.min()
    .combine(ee.Reducer.max(), '', true)
    .combine(ee.Reducer.stdDev().setOutputs(['stdev']), '', true)
    .combine(ee.Reducer.median().setOutputs(['med']), '', true)
    .combine(ee.Reducer.percentile([10, 25, 50, 75,90]), '', true)
    .combine(ee.Reducer.intervalMean(0, 10).setOutputs(['0010']), '', true)
    .combine(ee.Reducer.intervalMean(10, 25).setOutputs(['1025']), '', true)
    .combine(ee.Reducer.intervalMean(25, 50).setOutputs(['2550']), '', true)
    .combine(ee.Reducer.intervalMean(50, 75).setOutputs(['5075']), '', true)
    .combine(ee.Reducer.intervalMean(75, 90).setOutputs(['7590']), '', true)
    .combine(ee.Reducer.intervalMean(90, 100).setOutputs(['90100']), '', true)
    .combine(ee.Reducer.intervalMean(10, 90).setOutputs(['1090']), '', true)
    .combine(ee.Reducer.intervalMean(25, 75).setOutputs(['2575']), '', true);

var collection = ee.ImageCollection('COPERNICUS/S2_SR')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50))
  .filterDate(startDate, endDate)
  .filterBounds(site)
  .filter(ee.Filter.intersects(".geo", simpleCoastLine, null, null, 1000))
  //.filterMetadata('WRS_ROW', 'less_than', 120)  // descending (daytime) landsat scenes only
  //.map(cloud_mask.sentinel2())
  .map(mappingFunctions.maskS2clouds)
  .map(mappingFunctions.applyCoastMask)
  .select(bandsS, bandSelect);

//function generateCollection() { 
  // Create image collection
  //var L5collection = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
  //    .filterDate(startDate, endDate)
  //    .filterBounds(site)
  //    .filter(ee.Filter.intersects(".geo", simpleCoastLine, null, null, 1000))
  //    .filterMetadata('WRS_ROW', 'less_than', 120)  // descending (daytime) landsat scenes only
  //    .map(mappingFunctions.applyPixelQAcloudMask)
  //    .map(mappingFunctions.applyCoastMask)
  //    .select(bands7, bandSelect);
  //var L7collection = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
    //  .filterDate(startDate, endDate)
    //  .filterBounds(site)
    //  .filter(ee.Filter.intersects(".geo", simpleCoastLine, null, null, 1000))
    //  .filterMetadata('WRS_ROW', 'less_than', 120)  // descending (daytime) landsat scenes only
    //  .map(mappingFunctions.applyPixelQAcloudMask)
    //  .map(mappingFunctions.applyCoastMask)
    //  .select(bands7, bandSelect);
 // var L8collection = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
    //  .filterDate(startDate, endDate)
    //  .filterBounds(site)
    //  .filter(ee.Filter.intersects(".geo", simpleCoastLine, null, null, 1000))
    //  .filterMetadata('WRS_ROW', 'less_than', 120)  // descending (daytime) landsat scenes only
    //  .map(mappingFunctions.applyPixelQAcloudMask)
    //  .map(mappingFunctions.applyCoastMask)
    //  .select(bands8, bandSelect);
  //var collectionFull = ee.ImageCollection(L5collection
  //    .merge(L7collection)
   //   .merge(L8collection));
 // return collectionFull;
//}

//var collection = generateCollection(); 

var covariates = { 
  awei: collection.map(mappingFunctions.applyAWEI)
      .reduce(reducer, parallelScale), 
  ndwi: collection.map(mappingFunctions.applyNDWI)
      .reduce(reducer, parallelScale),
  mndwi: collection.map(mappingFunctions.applyMNDWI)
      .reduce(reducer, parallelScale),
  ndvi: collection.map(mappingFunctions.applyNDVI)
      .reduce(reducer, parallelScale),
  evi: collection.map(mappingFunctions.applyEVI)
      .reduce(reducer, parallelScale),
  nir: collection.select(['nir'])
      .reduce(ee.Reducer.intervalMean(10, 90)
      .setOutputs(['1090'])),
  green: collection.select(['green'],['gre'])
      .reduce(ee.Reducer.intervalMean(10, 90)
      .setOutputs(['1090'])),
  swir1: collection.select(['swir1'],['swi'])
      .reduce(ee.Reducer.intervalMean(10, 90)
      .setOutputs(['1090']))
};


// select variablefor export ([awei, ndwi, mndwi, ndvi, evi, nir, green, swir1)
var awei = covariates
    .awei
    .float(); 
var ndwi = covariates
    .ndwi
    .float();
var mndwi = covariates
    .mndwi
    .float();
var ndvi = covariates
    .ndvi
    .float();
var evi = covariates
    .evi
    .float();
var nir = covariates
    .nir
    .float();
var green = covariates
    .green
    .float();    
var swir1 = covariates
    .swir1
    .float();

var datasettem = ee.ImageCollection("ECMWF/ERA5/MONTHLY").map(mappingFunctions.applyCoastMask);
var Buffer1 = Buffer.updateMask(dataMask);
var minTemp_2022 = datasettem.select('minimum_2m_air_temperature').filter(ee.Filter.date('2020-01', '2020-03')).min();  
var minTemp_2022 = minTemp_2022.rename('minimum_2m')
var buffer=Buffer1.rename('distance')
print(minTemp_2022)
var elevation=ee.ImageCollection('JAXA/ALOS/AW3D30/V3_2').map(mappingFunctions.applyCoastMask);
var proj = elevation.first().select(0).projection();	
var type= Extent.rename('type')
var covariateComposite_2022 = ee.Image(awei)
          .addBands (ndwi)
          .addBands (mndwi)
          .addBands (ndvi)
          .addBands (evi)
          .addBands (nir)
          .addBands (green)
          .addBands (swir1)
          .addBands (ee.Image.pixelLonLat().select('latitude'))
          .addBands (elevation.mosaic().select('DSM'))
          .addBands (ee.Terrain.slope(elevation.mosaic().setDefaultProjection(proj)))
          .addBands (ee.Terrain.aspect(elevation.mosaic().setDefaultProjection(proj)))                    
          .addBands (ee.Image(minTemp_2022))
          .addBands(ee.Image(buffer))
          .addBands(ee.Image(type))
          
          
print(covariateComposite_2022);
var bands = covariateComposite_2022.bandNames();
var trainComposite_2022=covariateComposite_2022
print(trainComposite_2022);
//var covariateLibrary = ee.FeatureCollection('projects/ee-wyx10/assets/predictorSet_all');

var trainingLibrary = covariateLibrary
  .distinct('.geo') 
  .distinct('awe_0010')
  .filter(ee.Filter.neq('awe_min', null))
  .filter(ee.Filter.neq('latitude', null))
  .filter(ee.Filter.neq('slope', null))
  .randomColumn('random',1) 
  .sort('random'); 
	
//class_balanced	
var no_0 = ee.Number(trainingLibrary.filterMetadata('CLASS', 'equals',0).size());
var no_1 = ee.Number(trainingLibrary.filterMetadata('CLASS', 'equals',1).size());
var no_7 = ee.Number(trainingLibrary.filterMetadata('CLASS', 'equals',7).size());
var no_2 = ee.Number(trainingLibrary.filterMetadata('CLASS', 'equals',2).size());
var no_5 = ee.Number(trainingLibrary.filterMetadata('CLASS', 'equals',5).size());
var no_3 = ee.Number(trainingLibrary.filterMetadata('CLASS', 'equals',3).size());
	
	
var minClass = no_0.min(no_1).min(no_7).min(no_2).min(no_5).min(no_3);
var train_Dat2 = trainingLibrary
  .filterMetadata('CLASS', 'equals',0)
  .merge(trainingLibrary
    .filterMetadata('CLASS', 'equals',1))
    .merge(trainingLibrary
      .filterMetadata('CLASS', 'equals',7))
    .merge(trainingLibrary
      .filterMetadata('CLASS', 'equals',2))
    .merge(trainingLibrary
      .filterMetadata('CLASS', 'equals',5))
    .merge(trainingLibrary
      .filterMetadata('CLASS', 'equals',3));
      
//print("minClass",minClass);
	
var s1classifier = ee.Classifier.smileRandomForest({
      numberOfTrees: 450, 
      minLeafPopulation:3, //min.node.size
      variablesPerSplit: 20, // 0 is the default: sqrt of nPredictors 
      bagFraction: 0.8,
      seed: 0})
    .train(train_Dat2, 'CLASS', bands)
    .setOutputMode('CLASSIFICATION');
	
var type = trainComposite_2022
	//.select(bands_t1)
	//.updateMask(tw_change.select(['loss'])) //work only in loss patches
	.classify(s1classifier)
	
	
// File naming
//var assetName = 'type'
var assetName = 'GTW/GTW_12_49'
//.concat('_')
//.concat(yearString); // path and asset name
	
	// Export
Export.image.toAsset({
  image: type, 
  //description: assetName,
  assetId: assetName,
  scale: 10,
  region: site, 
  maxPixels: 10000000000000
});
