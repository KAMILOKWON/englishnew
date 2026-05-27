# GitHub Pages 배포 방법

이 프로젝트는 정적 사이트라 GitHub Pages에 바로 배포할 수 있습니다.

## 현재 구조

```text
kakao-english-mvp/
├── index.html
├── styles.css
├── app.js
├── README.md
└── .nojekyll

.github/workflows/deploy-pages.yml
```

`deploy-pages.yml`은 `kakao-english-mvp` 폴더를 GitHub Pages의 사이트 루트로 배포합니다.

## 배포 순서

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더를 git 저장소로 초기화하고 GitHub 원격 저장소에 push합니다.
3. GitHub 저장소의 `Settings > Pages`에서 `Source`를 `GitHub Actions`로 설정합니다.
4. `main` 브랜치에 push하면 Actions가 실행되고 Pages URL이 생성됩니다.

## 로컬에서 처음 올릴 때 예시

```bash
git init
git add .
git commit -m "Deploy Daily Talk English MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

배포가 끝나면 보통 아래 형식의 URL이 만들어집니다.

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

