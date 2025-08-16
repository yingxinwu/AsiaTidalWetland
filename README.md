# AsiaTidalWetland
**Large-scale tidal wetland mapping based on point-sample-driven debiased and label noise learning: A case study in Asia**

---

## 🌊 Overview  
Reliable tidal wetland maps are crucial for understanding coastal dynamics, monitoring ecosystem changes, and supporting conservation strategies. However, tidal wetlands are highly dynamic due to flooding cycles, natural processes, and human activities, making large-scale and high-accuracy mapping a major challenge.  

This repository provides the **Asian Tidal Wetland Mapping Product (2022, 10m resolution)** and the **code framework** for point-sample-driven mapping, integrating **debiased sampling** and **noise-resistant learning**.  

Our method addresses two key challenges:  
- **Sample scarcity**: Most available tidal wetland data are point-based, while deep learning requires dense pixel-wise labels.  
- **Sample noise & bias**: Pseudo-labels derived from point samples often contain spatial bias and semantic errors.  

By modeling covariate statistics and incorporating category confusion probabilities, we generated more reliable training data for deep learning classifiers.  
The resulting product covers **tidal wetlands across Asia’s coastline (~3,800,000 km²)** and achieves **higher accuracy** than existing approaches.  

---

## ✨ Key Features  
- 🌍 **Large-scale tidal wetland mapping** across Asia (10m resolution)  
- 🛰️ **Point-sample-driven deep learning framework**, converting sparse points into pixel-wise pseudo-labels  
- ⚖️ **Debiased sampling** to correct covariate-driven sample selection bias  
- 🔍 **Noise-resistant learning** using confusion probabilities to suppress label noise  
- 📊 **Benchmark experiments** demonstrate consistent improvement over state-of-the-art methods  

---

## 📂 Data Access  
The **classified tidal wetland maps** are publicly available:  
👉 [GitHub Repository Link](https://github.com/yingxinwu/AsiaTidalWetland.git)  

**Data format:**  
- GeoTIFF (`.tif`) files, 10m resolution  
- Categories: `land`, `water`, `tidal flat`, `mangrove`, `marsh`, `pond`  

---

## 🏷️ Keywords  
`remote sensing` · `tidal wetlands` · `deep learning` · `sample selection bias` · `label noise`  

---

## 📬 Contact  
For questions or collaborations, please contact:  
**Yingxin Wu**  
📧 Email: [wuyingxin@whu.edu.cn](mailto:wuyingxin@whu.edu.cn)  
