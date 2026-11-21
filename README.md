<div align="center">

# SlashFavorites

**Your five most-used bot slash commands, one click from the chat box.**

[![Equicord userplugin](https://img.shields.io/badge/Equicord-userplugin-5865F2?logo=discord&logoColor=white)](https://github.com/Equicord/Equicord)
[![Vencord compatible](https://img.shields.io/badge/Vencord-userplugin-ED4245?logo=vencord&logoColor=white)](https://github.com/Vendicated/Vencord)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

[Install](#install) · [Setup](#setup) · [Usage](#usage) · [Under the hood](#under-the-hood) · [FAQ](#faq)

</div>

---

Typing `/` and scrolling a bot's command list every single time gets old. SlashFavorites pins up to five slash commands as chips right above the message box. One click drops the command into your input and focuses it — Enter runs it.

## Install

Clone the plugin into your userplugins folder and rebuild:

```bash
# from your Equicord or Vencord checkout
cd src/userplugins
git clone https://github.com/A9RASH/favouritecommands.git
cd ../..
pnpm install
pnpm build
```

Restart Discord and enable it under **Settings › Plugins › SlashFavorites**. Vencord uses the same steps.

## Setup

Open **Settings › Plugins › SlashFavorites** and add up to five entries. Each entry has a label and the command text:

| Label | Command |
| --- | --- |
| Poll | `/poll` |
| Roll | `/roll 1d20` |
| Purge | `/purge 50` |
| Ticket | `/ticket open` |
| Ping | `/ping` |

The label is what the chip displays. The command field is exactly what you would type, arguments included. A leading `/` is optional — it gets added if you leave it off.

## Usage

Chips sit right above the composer and track it as you resize the window, switch channels, or the input grows.

- Click a chip to insert the command into the message box and focus it.
- Press Enter to run it.
- Commands execute in the current server and channel, so the bot needs that command registered there.

No auto-send on purpose: Discord parses slash commands in the composer, and inserting then letting you confirm is the reliable path.

## Under the hood

- The bar is a fixed element positioned from the composer's bounding box and kept in place with a `MutationObserver`, a `ResizeObserver`, and window resize events.
- A click dispatches `INSERT_TEXT` through Discord's component dispatch (`insertTextIntoChatInputBox`) followed by `TEXTAREA_FOCUS`.
- Favorites live in the plugin's settings as a custom array capped at five entries, edited from the plugin's settings page.
- No network calls and no third-party endpoints.

## FAQ

**Why doesn't a click send the command immediately?**
Slash commands are resolved by Discord's composer as you submit them. Inserting the text and focusing the box keeps that pipeline intact — firing a synthetic Enter is fragile and can post the slash text as a plain message instead of running anything.

**The bar isn't showing**
It only appears when the plugin is enabled, at least one favorite has a command, and a message box is on screen. Check **Settings › Plugins › SlashFavorites**.

**The command went in as plain text**
The bot doesn't have that command registered in the current server, or the name is off. Check the command with `/` autocomplete once, then copy it exactly.

**Does this work on Vencord?**
Yes. It uses the shared plugin API, DOM APIs, and Discord's component dispatch — the same folder works on Equicord and Vencord.

**Terms of Service**
Client mods are against Discord's Terms of Service. This plugin only automates text entry you could type yourself. You take the risk.

## Credits

Built by A9RASH. Equicord and Vencord underneath.

## License

GPL-3.0.
