import base64, json, urllib.request
from pathlib import Path

image_path = Path(r"C:\Users\Coop Agronorte\AppData\Local\hermes\cache\images\img_9e86fe9ca9a9.jpg")
out_path = Path(r"C:\Users\Coop Agronorte\Documents\Coop_Agronorte_Hidroponia\Sistema_Importado\docs\OLLAMA_DIRECAO_ANIMACAO_HOME.md")
prompt = """Você é diretor de motion design e engenheiro WebGL. Analise a imagem anexada, destinada à tela principal de um sistema hidropônico da Cooperativa Agronorte. A bandeira da Cooperativa foi rejeitada: deve existir APENAS a bandeira do Paraguai que já aparece na imagem. Precisamos animar ao vivo no navegador, preservando absolutamente todos os textos, logotipos, botão e HUD sem deformação. Desejamos: bandeira do Paraguai ondulando, folhas e frutos balançando com vento orgânico em grupos e o sol surgindo gradualmente no horizonte, em loop elegante. Produza uma crítica objetiva da imagem achatada, mapa de regiões aproximadas em pixels considerando 1280x853, riscos de artefatos, proposta de shader WebGL em camadas, amplitudes/frequências recomendadas, timing do nascer do sol, critérios de desempenho, acessibilidade prefers-reduced-motion e critérios de aprovação visual. Não invente novos elementos nem altere marcas/textos."""
payload = {
    "model": "gemma4:12b",
    "stream": False,
    "keep_alive": -1,
    "messages": [{
        "role": "user",
        "content": prompt,
        "images": [base64.b64encode(image_path.read_bytes()).decode("ascii")]
    }],
    "options": {"temperature": 0.2, "num_ctx": 8192, "num_predict": 2200}
}
req = urllib.request.Request("http://127.0.0.1:11434/api/chat", data=json.dumps(payload).encode(), headers={"Content-Type":"application/json"})
with urllib.request.urlopen(req, timeout=900) as response:
    data = json.load(response)
text = data["message"]["content"]
out_path.write_text("# Direção de animação — análise local Gemma 4 12B\n\n" + text + "\n", encoding="utf-8")
print(text)
print("METRICS", json.dumps({k:data.get(k) for k in ["total_duration","load_duration","prompt_eval_count","prompt_eval_duration","eval_count","eval_duration"]}))
print("SAVED", out_path)
