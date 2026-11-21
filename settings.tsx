/*
 * SlashFavorites - pinned bot slash commands above the chat input
 * Made By A9RASH
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { Heading } from "@components/Heading";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { OptionType } from "@utils/types";
import { React, TextInput } from "@webpack/common";

export interface FavoriteCommand {
    id: string;
    label: string;
    command: string;
}

export const MAX_FAVORITES = 5;

function updateFavorites(next: FavoriteCommand[]) {
    settings.store.favorites = next;
}

function FavoritesEditor() {
    const { favorites } = settings.use(["favorites"]);

    function setField(id: string, key: "label" | "command", value: string) {
        updateFavorites(favorites.map(f => f.id === id ? { ...f, [key]: value } : f));
    }

    return (
        <>
            <Heading className={Margins.bottom8}>Favorites</Heading>
            <Paragraph className={Margins.bottom8}>
                Up to five slash commands. Each one becomes a chip above the chat box. Clicking a chip inserts
                the command into your input and focuses it, so pressing Enter runs it.
            </Paragraph>

            {favorites.map((favorite, index) => (
                <div className="vc-slash-favs-row" key={favorite.id}>
                    <TextInput
                        value={favorite.label}
                        placeholder={`Label ${index + 1} (e.g. Poll)`}
                        maxLength={32}
                        onChange={value => setField(favorite.id, "label", value)}
                    />
                    <TextInput
                        value={favorite.command}
                        placeholder="/command"
                        maxLength={128}
                        onChange={value => setField(favorite.id, "command", value)}
                    />
                    <Button
                        size="small"
                        variant="dangerSecondary"
                        onClick={() => updateFavorites(favorites.filter(f => f.id !== favorite.id))}
                    >
                        Remove
                    </Button>
                </div>
            ))}

            <Button
                size="small"
                disabled={favorites.length >= MAX_FAVORITES}
                onClick={() => updateFavorites([...favorites, { id: crypto.randomUUID(), label: "", command: "" }])}
            >
                Add favorite
            </Button>
        </>
    );
}

export const settings = definePluginSettings({
    favorites: {
        type: OptionType.CUSTOM,
        default: [] as FavoriteCommand[],
        description: "Pinned slash commands."
    },
    editor: {
        type: OptionType.COMPONENT,
        component: FavoritesEditor
    }
});
