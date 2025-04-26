enum MessageType {
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
    INFO = 'info',
}

export interface Message {
    type: MessageType;
    message: string;
}

class Messenger {
    messages: Message[];
    constructor() {
        this.messages = [];
    }

    msg(type: MessageType, message: string): void {
        this.messages.push({ type, message });
    }

    success(message: string): void {
        this.msg(MessageType.SUCCESS, message);
    }

    warning(message: string): void {
        this.msg(MessageType.WARNING, message);
    }

    error(message: string): void {
        this.msg(MessageType.ERROR, message);
    }

    info(message: string): void {
        this.msg(MessageType.INFO, message);
    }

    isNoError(): boolean {
        return !this.messages.some((message) => message.type === MessageType.ERROR);
    }

    map(callback: (message: Message) => any): any[] {
        return this.messages.map(callback);
    }
}

export default Messenger;