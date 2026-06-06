"""Shared Nova (Amazon Bedrock) invocation helper — used by ALL services."""
import boto3
import json
import os

from backend.core.config import AWS_REGION, BEDROCK_MODEL_ID, MOCK_MODE

_MOCK_RESPONSE = json.dumps({
    "mock": True,
    "message": "MOCK_MODE is enabled. Set MOCK_MODE=false and add real AWS credentials."
})


def invoke_nova(system_prompt: str, user_message: str) -> str:
    """
    Invoke Amazon Nova Pro via Bedrock.
    All services call this function — never call boto3 directly.

    Returns raw string (Nova's text response).
    Falls back to a mock JSON string when MOCK_MODE=true.
    """
    if MOCK_MODE:
        return _MOCK_RESPONSE

    client = boto3.client(
        "bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

    body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": user_message}],
            }
        ],
        "system": [{"type": "text", "text": system_prompt}],
        "max_tokens": 1500,
        "anthropic_version": "bedrock-2023-05-31",
    })

    try:
        response = client.invoke_model(modelId=BEDROCK_MODEL_ID, body=body)
        result = json.loads(response["body"].read())
        return result["content"][0]["text"]
    except Exception as e:
        raise RuntimeError(f"Nova invocation failed: {str(e)}")
