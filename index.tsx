/*
 * SlashFavorites - pinned bot slash commands above the chat input
 * Made By A9RASH
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { SettingsStore } from "@api/Settings";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin from "@utils/types";
import { findCssClassesLazy } from "@webpack";
import { ComponentDispatch } from "@webpack/common";

import { FavoriteCommand, MAX_FAVORITES, settings } from "./settings";

const ChannelTextAreaClasses = findCssClassesLazy("channelTextArea");
const SETTINGS_PATH = "plugins.SlashFavorites.favorites";
const BAR_GAP = 8;

let bar: HTMLDivElement | null = null;
let observer: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let observedArea: HTMLElement | null = null;
let syncScheduled = false;
let renderedSignature = "";

function validFavorites(): FavoriteCommand[] {
    return settings.store.favorites
        .filter(f => f.command.trim().length > 0)
        .slice(0, MAX_FAVORITES);
}

function normalizeCommand(raw: string) {
    const command = raw.trim();
    return command.startsWith("/") ? command : `/${command}`;
}

function triggerFavorite(favorite: FavoriteCommand) {
    insertTextIntoChatInputBox(`${normalizeCommand(favorite.command)} `);
    ComponentDispatch.dispatchToLastSubscribed("TEXTAREA_FOCUS");
}

function buildButton(favorite: FavoriteCommand) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vc-slash-favs-btn";
    button.textContent = favorite.label.trim() || normalizeCommand(favorite.command);
    button.title = normalizeCommand(favorite.command);
    button.addEventListener("click", () => triggerFavorite(favorite));
    return button;
}

function renderButtons(favorites: FavoriteCommand[]) {
    if (!bar) return;

    const signature = favorites.map(f => `${f.label}\u0000${f.command}`).join("\u0001");
    if (signature === renderedSignature) return;

    renderedSignature = signature;
    bar.replaceChildren(...favorites.map(buildButton));
}

function getComposerArea() {
    return document.querySelector<HTMLElement>(`.${ChannelTextAreaClasses.channelTextArea}`);
}

function scheduleSync() {
    if (syncScheduled) return;
    syncScheduled = true;
    requestAnimationFrame(() => {
        syncScheduled = false;
        sync();
    });
}

function sync() {
    if (!bar) return;
    if (!bar.isConnected && document.body) document.body.appendChild(bar);

    const area = getComposerArea();
    if (area && resizeObserver) {
        if (observedArea !== area) {
            if (observedArea) resizeObserver.unobserve(observedArea);
            resizeObserver.observe(area);
            observedArea = area;
        }
    }

    const favorites = validFavorites();
    if (!area || !favorites.length) {
        bar.style.display = "none";
        return;
    }

    renderButtons(favorites);
    bar.style.display = "flex";

    const rect = area.getBoundingClientRect();
    bar.style.left = `${rect.left}px`;
    bar.style.width = `${rect.width}px`;
    bar.style.bottom = `${window.innerHeight - rect.top + BAR_GAP}px`;
}

function onSettingsChange() {
    scheduleSync();
}

export default definePlugin({
    name: "SlashFavorites",
    description: "Pin up to five bot slash commands as quick-trigger buttons above the chat input.",
    authors: [{ name: "A9RASH", id: 0n }],
    tags: ["Chat", "Utility"],
    searchTerms: ["slash", "command", "favorites", "app", "bot"],
    settings,

    start() {
        bar = document.createElement("div");
        bar.className = "vc-slash-favs";
        bar.setAttribute("role", "toolbar");
        bar.setAttribute("aria-label", "Favorite slash commands");
        bar.style.display = "none";

        if (document.body) document.body.appendChild(bar);

        resizeObserver = new ResizeObserver(scheduleSync);
        observer = new MutationObserver(scheduleSync);
        observer.observe(document.body ?? document.documentElement, { childList: true, subtree: true });
        window.addEventListener("resize", scheduleSync);
        SettingsStore.addChangeListener(SETTINGS_PATH, onSettingsChange);

        scheduleSync();
    },

    stop() {
        observer?.disconnect();
        resizeObserver?.disconnect();
        SettingsStore.removeChangeListener(SETTINGS_PATH, onSettingsChange);
        window.removeEventListener("resize", scheduleSync);

        bar?.remove();
        bar = null;
        observer = null;
        resizeObserver = null;
        observedArea = null;
        renderedSignature = "";
    }
});
