#!/bin/bash

# CognitoユーザープールIDを環境変数から取得
USER_POOL_ID="${COGNITO_USER_POOL_ID:-ap-northeast-1_5JWcYd5nx}"

# テストユーザーの情報
declare -A USERS=(
  ["john.dev@example.com"]="John Developer"
  ["alice.code@example.com"]="Alice Coder"
  ["bob.eng@example.com"]="Bob Engineer"
)

echo "Cognitoユーザープールにテストユーザーを作成します..."
echo "User Pool ID: ${USER_POOL_ID}"
echo ""

for email in "${!USERS[@]}"; do
  name="${USERS[$email]}"
  echo "ユーザーを作成中: ${name} (${email})"
  
  # ユーザーを作成（一時パスワード付き）
  aws cognito-idp admin-create-user \
    --user-pool-id "${USER_POOL_ID}" \
    --username "${email}" \
    --user-attributes Name=email,Value="${email}" Name=name,Value="${name}" \
    --message-action SUPPRESS \
    --temporary-password "TempPass123!" \
    --region ap-northeast-1
  
  if [ $? -eq 0 ]; then
    echo "✅ ユーザー作成成功: ${email}"
    
    # ユーザーのsubを取得
    SUB=$(aws cognito-idp admin-get-user \
      --user-pool-id "${USER_POOL_ID}" \
      --username "${email}" \
      --region ap-northeast-1 \
      --query 'UserAttributes[?Name==`sub`].Value' \
      --output text)
    
    echo "  Sub: ${SUB}"
    echo ""
  else
    echo "❌ ユーザー作成失敗: ${email}"
    echo ""
  fi
done

echo "完了しました。"
echo ""
echo "以下のコマンドでユーザーのsubを確認できます:"
echo "aws cognito-idp admin-get-user --user-pool-id ${USER_POOL_ID} --username <email> --query 'UserAttributes[?Name==\`sub\`].Value' --output text"

