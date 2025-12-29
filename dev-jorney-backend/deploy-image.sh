#!/bin/bash

# .envファイルを読み込む
if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//' | xargs) | envsubst)
fi

#1. 作成時刻をタグにする
NOW_TAG=$(date +%Y%m%d%H%M%S)
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "--- Step 1: ECR Login ---"
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_URL}

echo "--- Step 2: Build Image ---"
docker build -t ${REPO_NAME}:latest .

echo "--- Step 3: Tag Image (Tag: ${IMAGE_TAG}) ---"
docker tag ${REPO_NAME}:latest ${ECR_URL}/${REPO_NAME}:${NOW_TAG}

echo "--- Step 4: Push to ECR ---"
docker push ${ECR_URL}/${REPO_NAME}:${NOW_TAG}

echo "--- Done! ---"
echo "Next command: npx cdk deploy DevAppStack -c imageTag=${NOW_TAG}"