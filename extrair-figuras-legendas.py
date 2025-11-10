import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import os
from pathlib import Path

def download_image(img_url, save_dir, filename):
    """
    Baixa uma imagem da URL e salva no diretório especificado.

    Args:
        img_url (str): URL da imagem
        save_dir (str): Diretório onde a imagem será salva
        filename (str): Nome do arquivo para salvar

    Returns:
        str: Caminho completo do arquivo salvo, ou None se houver erro
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        response = requests.get(img_url, headers=headers, timeout=30)
        response.raise_for_status()

        # Cria o diretório se não existir
        Path(save_dir).mkdir(parents=True, exist_ok=True)

        # Caminho completo do arquivo
        filepath = os.path.join(save_dir, filename)

        # Salva a imagem
        with open(filepath, 'wb') as f:
            f.write(response.content)

        print(f"Imagem salva: {filepath}")
        return filepath

    except Exception as e:
        print(f"Erro ao baixar imagem {img_url}: {e}")
        return None

def extract_figures_from_pmc(pmcid, download_images=False, images_dir="imagens"):
    """
    Extrai figuras e suas legendas de um artigo do PMC.

    Args:
        pmcid (str): ID do artigo no formato "PMC9423874"
        download_images (bool): Se True, baixa as imagens para o diretório especificado
        images_dir (str): Diretório onde as imagens serão salvas (padrão: "imagens")

    Returns:
        list: Lista de dicionários contendo informações das figuras
    """
    url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/"
    
    # Headers para simular um navegador real
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        figures = []
        
        # Procura por todas as tags <figure>
        for figure in soup.find_all("figure"):
            fig_data = {}
            
            # Extrai o ID da figura (ex: "Fig1")
            fig_id = figure.get("id", "")
            fig_data["id"] = fig_id
            
            # Extrai o título da figura (ex: "Fig. 1.")
            title_tag = figure.find("h4", class_="obj_head")
            fig_data["title"] = title_tag.get_text(strip=True) if title_tag else ""
            
            # Extrai a URL da imagem do CDN (atributo src da tag <img>)
            img_url = None
            img_tag = figure.find("img", class_="graphic")
            if img_tag and img_tag.get("src"):
                img_url = img_tag["src"]
                # Converte URL relativa em absoluta
                img_url = urljoin(url, img_url)
            
            fig_data["url"] = img_url

            # Baixa a imagem se solicitado
            if download_images and img_url:
                # Extrai a extensão da URL ou usa .jpg como padrão
                ext = os.path.splitext(img_url)[1] or '.jpg'
                # Nome do arquivo: pmcid_figid.ext (ex: PMC9423874_Fig1.jpg)
                filename = f"{pmcid}_{fig_id}{ext}"

                # Baixa e salva a imagem
                local_path = download_image(img_url, images_dir, filename)
                fig_data["local_path"] = local_path

            # Extrai a legenda dentro de <figcaption>
            caption_tag = figure.find("figcaption")
            caption = caption_tag.get_text(strip=True) if caption_tag else "Sem legenda"
            fig_data["caption"] = caption
            
            # Extrai o alt text da imagem
            img_tag = figure.find("img")
            fig_data["alt_text"] = img_tag.get("alt", "") if img_tag else ""
            
            # Extrai dimensões da imagem
            if img_tag:
                fig_data["width"] = img_tag.get("width", "")
                fig_data["height"] = img_tag.get("height", "")
            
            if img_url:
                figures.append(fig_data)
        
        return figures
    
    except requests.RequestException as e:
        print(f"Erro ao acessar o artigo: {e}")
        return []


# Exemplo de uso
if __name__ == "__main__":
    pmcid = "PMC9423874"

    # Para apenas extrair os dados (sem baixar imagens)
    # figures = extract_figures_from_pmc(pmcid)

    # Para extrair os dados E baixar as imagens
    figures = extract_figures_from_pmc(pmcid, download_images=True, images_dir="imagens")
    
    if figures:
        print(f"Encontradas {len(figures)} figura(s) no artigo {pmcid}\n")
        print("=" * 80)
        
        for i, fig in enumerate(figures, start=1):
            print(f"\nFigura {i}:")
            print(f"ID: {fig['id']}")
            print(f"Título: {fig['title']}")
            print(f"Legenda: {fig['caption']}")
            print(f"Alt Text: {fig['alt_text']}")
            print(f"Dimensões: {fig.get('width', 'N/A')}x{fig.get('height', 'N/A')}")
            print(f"URL: {fig['url']}")
            if 'local_path' in fig and fig['local_path']:
                print(f"Arquivo local: {fig['local_path']}")
            print("-" * 80)
    else:
        print(f"Nenhuma figura encontrada no artigo {pmcid}")