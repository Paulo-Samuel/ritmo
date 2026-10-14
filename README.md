# Ritmo — player de música local

Um player com a mesma organização de tela do Spotify (biblioteca à esquerda, conteúdo no meio, "Tocando agora" à direita, controles embaixo), mas que toca **as músicas do seu computador**. Nada é enviado para a internet.

## Como instalar

Baixe o **Ritmo-Instalador.exe** da [página de versões](https://github.com/Paulo-Samuel/ritmo/releases/latest) e instale. Depois disso, **o app se atualiza sozinho**: ele confere se há versão nova ao abrir (e a cada 4 horas), baixa em segundo plano e mostra "Nova versão pronta · Reiniciar". Se você não reiniciar, a atualização entra quando o app for fechado. Para conferir na hora, clique no logo **Ritmo** → **Procurar atualizações**.

Na primeira vez, o Windows pode mostrar "O Windows protegeu o computador", porque o app não tem assinatura digital paga. Clique em **Mais informações → Executar assim mesmo**.

Outras formas de abrir (estas **não** se atualizam sozinhas):
- `npm run dist:portatil` gera `dist\Ritmo.exe`, um arquivo único portátil.
- `iniciar.bat` abre no navegador (http://localhost:5173). Precisa do Node.js.

A biblioteca do app e a do navegador são separadas: cada uma guarda as próprias músicas.

## Publicar uma versão nova

O código fica em [github.com/Paulo-Samuel/ritmo](https://github.com/Paulo-Samuel/ritmo). Depois de mudar algum arquivo e fazer o commit:

```
npm run release
```

Isso sobe o número da versão (1.1.0 → 1.1.1), envia para o GitHub, e o GitHub monta o instalador e publica a versão sozinho em alguns minutos. Todo mundo com o Ritmo instalado recebe a atualização.

Para testar sem publicar:

```
npm install          (só na primeira vez)
npm start            → abre o app direto do código
npm run dist         → gera dist\Ritmo-Instalador.exe localmente
```

## O que dá para fazer

- Adicionar músicas ou uma pasta inteira (botão **+** na biblioteca), ou arrastar arquivos e pastas para a janela.
- Formatos: MP3, M4A/AAC, WAV, OGG/Opus, FLAC, WebM.
- Título, artista, álbum e capa são lidos das tags do MP3. Sem tags, o nome do arquivo vira "Artista - Título".
- Curtir músicas, criar, renomear e excluir playlists, ver páginas de artista e de álbum (na ordem das faixas).
- **Várias músicas de uma vez:** Ctrl+clique, Shift+clique ou Ctrl+A selecionam; aparece uma barra para adicionar tudo à playlist ou à fila. O botão direito também age na seleção inteira.
- **"Adicionar tudo à playlist"** no menu ⋯ de qualquer álbum, artista, busca ou da lista "Todas as músicas".
- **Pasta vira playlist:** ao adicionar uma pasta (por exemplo, uma trilha sonora), o Ritmo oferece criar uma playlist com o nome dela, na ordem 1, 2, 3… 10. Arrastar arquivos com uma playlist aberta coloca as músicas direto nela.
- Busca por título, artista ou álbum, ignorando acentos.
- Fila (adicionar à fila, pular para qualquer música da fila), ordem aleatória, repetir tudo ou uma.
- Teclas de mídia do teclado e o controle de mídia do Windows funcionam.
- Biblioteca, capas e playlists ficam salvas no navegador. Fechou e abriu de novo, está tudo lá.
- "Carregar músicas de demonstração" gera 5 faixas sintetizadas para testar sem arquivos.

### Baixar do YouTube (só no app)

Clique no botão de download (seta para baixo) ao lado do Início, cole o link e escolha:

- **MP3**: áudio com capa e nome do artista. Toca em qualquer aparelho.
- **M4A**: áudio no formato original do YouTube, sem conversão (melhor qualidade, mais rápido).
- **MP4**: vídeo com som, até 1080p.

Os arquivos vão para a pasta **Música\Ritmo** e entram direto na biblioteca. Funciona também com links de outros sites suportados pelo [yt-dlp](https://github.com/yt-dlp/yt-dlp).

Na primeira vez, o app baixa duas ferramentas gratuitas, o yt-dlp e o ffmpeg (cerca de 50 MB), direto dos sites oficiais, e as guarda em `%APPDATA%\Ritmo\bin`. O yt-dlp se atualiza sozinho a cada vez que você abre o app e baixa algo, porque o YouTube muda com frequência.

Baixe só o que você tem direito de baixar: seus próprios vídeos ou conteúdo liberado pelo autor (Creative Commons, domínio público). Os termos do YouTube não permitem baixar outros vídeos sem autorização.

### Atalhos

| Tecla | Ação |
| --- | --- |
| Espaço | Tocar / pausar |
| ← / → | Voltar / avançar 5 segundos |
| Alt + ← / → | Música anterior / próxima |
| Ctrl + K | Buscar |
| Ctrl + A | Selecionar todas as músicas da lista |
| Ctrl + clique / Shift + clique | Selecionar várias músicas |
| Esc | Limpar a seleção |
| Duplo clique na música | Tocar |
| Botão direito na música | Menu (fila, playlist, curtir, remover) |

## Personalizar

- **Cor principal:** troque `--accent` no topo de `styles.css`.
- **Nome:** troque "Ritmo" em `index.html`.

## Observações

- A biblioteca fica guardada no navegador que você usar. Se abrir em outro navegador, ou limpar os dados do site, ela começa vazia.
- Remover uma música da biblioteca **não** apaga o arquivo original do seu computador.
- Não toca o catálogo do Spotify: o áudio de lá é protegido e só funciona no app oficial.

## Arquivos

- `index.html`: estrutura da página
- `styles.css`: visual
- `app.js`: player, biblioteca, playlists e leitura das tags
- `server.js`: servidor local (só aceita conexões desta máquina)
- `iniciar.bat`: atalho para abrir no navegador
- `main.js`: janela do app de desktop (Electron)
- `preload.js`: ponte segura entre a janela e o computador
- `downloader.js`: download de links com yt-dlp e ffmpeg
- `updater.js`: atualização automática pelo GitHub
- `icon.png`: ícone do app
- `package.json`: configuração para gerar o instalador
- `.github/workflows/release.yml`: monta e publica o instalador quando uma versão nova é enviada
