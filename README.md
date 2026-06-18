# FaaS Face Detection ☁️🔍

> A **serverless face detection function** deployed on a Kubernetes cluster via OpenFaaS — Cloud Computing @ UGR ETSIIT.

<div align="center">

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![OpenFaaS](https://img.shields.io/badge/OpenFaaS-3B4048?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

</div>

---

## ✨ What it does

Send an image → get back face detection results. Fully serverless, scales to zero, deployed on a real Kubernetes cluster hosted at UGR.

## 🏗️ Architecture

```
Client → OpenFaaS Gateway → Function Pod (face detection) → Response
               ↑
         Kubernetes cluster (UGR server)
```

## ✨ Features

- 🐳 Containerized function with Docker
- ☸️ Deployed on Kubernetes via OpenFaaS
- 🧠 Face detection using Python (OpenCV / face_recognition)
- ⚡ Scales to zero when idle

## 🚀 Deploy

```bash
# Build and deploy the function
faas-cli build -f stack.yml
faas-cli push -f stack.yml
faas-cli deploy -f stack.yml
```

## 👨‍💻 Author

**Anas Tahir** — M.Sc. CS @ UGR · [github.com/anas-tahi](https://github.com/anas-tahi)
