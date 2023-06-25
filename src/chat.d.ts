export type ChatComponent = TranslationComponent | KeybindComponent | ScoreComponent | SelectorComponent | NBTComponent | MainChatComponent;

export type MainChatComponent = {
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underlined?: boolean;
    strikethrough?: boolean;
    obfuscated?: boolean;
    font?: string;
    color?: string;
    insertion?: string;
    clickEvent?: {
        action: 'open_url' | 'open_file' | 'run_command' | 'suggest_command' | 'change_page' | 'copy_to_clipboard';
        value: string;
    };
    hoverEvent?: {
        action: 'show_text' | 'show_item' | 'show_entity';
        contents: string | ChatComponent;
    };
    extra?: ChatComponent[];
};

export type TranslationComponent = {
    translate: string;
    with?: Array<string | ChatComponent>;
};

export type KeybindComponent = {
    keybind: string;
};

export type ScoreComponent = {
    score: {
        name: string;
        objective: string;
        value?: string;
    };
};

export type SelectorComponent = {
    selector: string;
};

export type NBTComponent = {
    nbt: {
        block?: string;
        entity?: string;
        storage?: string;
    };
    separator?: ChatComponent;
    interpret?: boolean;
};
