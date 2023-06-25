import { ChatComponent, MainChatComponent } from './chat';
import { DataTypes } from './datatype';

export default class ChatBuilder {
    private _chat: MainChatComponent = {};

    public constructor(text?: string) {
        if (text) {
            this.text(text);
        }
    }

    public text(text: string): ChatBuilder {
        this._chat.text = text;

        return this;
    }

    public bold(bold: boolean): ChatBuilder {
        this._chat.bold = bold;

        return this;
    }

    public italic(italic: boolean): ChatBuilder {
        this._chat.italic = italic;

        return this;
    }

    public underlined(underlined: boolean): ChatBuilder {
        this._chat.underlined = underlined;

        return this;
    }

    public strikethrough(strikethrough: boolean): ChatBuilder {
        this._chat.strikethrough = strikethrough;

        return this;
    }

    public obfuscated(obfuscated: boolean): ChatBuilder {
        this._chat.obfuscated = obfuscated;

        return this;
    }

    public font(font: string): ChatBuilder {
        this._chat.font = font;

        return this;
    }

    public color(color: string): ChatBuilder {
        this._chat.color = color;

        return this;
    }

    public insertion(insertion: string): ChatBuilder {
        this._chat.insertion = insertion;

        return this;
    }

    public clickEvent(action: 'open_url' | 'open_file' | 'run_command' | 'suggest_command' | 'change_page' | 'copy_to_clipboard', value: string): ChatBuilder {
        this._chat.clickEvent = {
            action,
            value
        };

        return this;
    }

    public hoverEvent(action: 'show_text' | 'show_item' | 'show_entity', contents: string | MainChatComponent): ChatBuilder {
        this._chat.hoverEvent = {
            action,
            contents
        };

        return this;
    }

    public extra(extra: ChatComponent[]): ChatBuilder {
        this._chat.extra = extra;

        return this;
    }

    public build(): MainChatComponent {
        return this._chat;
    }

    public toFormattedString(): string {
        const modChar = '\u00a7'; // §
        const modifiers = {
            bold: 'l',
            italic: 'o',
            underlined: 'n',
            strikethrough: 'm',
            obfuscated: 'k'
        };

        let str = '';

        if (this._chat.color) {
            str += `${modChar}${this._chat.color}`;
        }

        for (const [key, value] of Object.entries(modifiers)) {
            if (this._chat[key as keyof MainChatComponent]) {
                str += `${modChar}${value}`;
            }
        }

        if (this._chat.text) {
            str += this._chat.text;
        }

        if (this._chat.extra) {
            for (const extra of this._chat.extra) {
                str += ChatBuilder.fromChatComponent(extra).toFormattedString();
            }
        }

        return str;
    }

    public encode(): Buffer {
        return DataTypes.Chat.encode(this._chat);
    }

    public static text(text: string): ChatBuilder {
        return new ChatBuilder(text);
    }

    public static fromChatComponent(component: ChatComponent): ChatBuilder {
        const builder = new ChatBuilder();

        Object.assign(builder._chat, component);

        return builder;
    }
}
