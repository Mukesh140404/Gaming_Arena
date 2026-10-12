import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface RoomMessage {
    message: string;
    connectionId?: string;
    userId?: string;
    name?: string;
    roomId?: string;
}

interface RoomMessageBoxProps {
    handleSendRoomMessage: (message: string) => void;
    messages: RoomMessage[];
    currentUserId?: string;
}

export const RoomMessageBox = ({ handleSendRoomMessage,
    messages,
    currentUserId, }: RoomMessageBoxProps) => {
    const [message, setMessage] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    const send = () => {
        const text = message.trim();
        if (!text) return;
        handleSendRoomMessage(text);
        setMessage("");
    };
    return (
        <Card className="rounded-3xl h-100 aspect-square border border-gray-200/80 bg-black p-5 shadow-xs flex flex-col">
            <div className="h-4/5 border rounded-3xl border-white/20 bg-white/10 scrollbar-none overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                    <p className="text-xs text-white/40 text-center mt-4">
                        No messages yet. Say hi!
                    </p>
                )}
                {messages.map((m, i) => {
                    const isMine = m.userId === currentUserId || m.connectionId === currentUserId;

                    return (
                        <div
                            key={i}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm wrap-break-word ${isMine
                                        ? "bg-[#FF6562] text-white rounded-br-sm"
                                        : "bg-white/20 text-white rounded-bl-sm"
                                    }`}
                            >
                                {!isMine && m.name && (
                                    <span className="block text-[10px] font-bold text-[#FF6562]">
                                        {m.name}
                                    </span>
                                )}
                                {m.message}
                            </div>
                        </div>
                    );
                })}

                <div ref={bottomRef} />
            </div>

            <div className="h-1/5 border border-white/20 bg-white/20 p-1 flex items-center gap-2 rounded-full">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    type="text"
                    className="bg-transparent focus:outline-none ps-6 text-white h-full flex-1"
                    placeholder="Type your message..."
                />
                <button
                    onClick={send}
                    className="px-4 h-full aspect-square rounded-full bg-linear-to-tr from-[#FF6562] to-[#FF6562] flex items-center justify-center shadow-xs"
                >
                    <ArrowUpRight className="h-4 w-4 text-white" />
                </button>
            </div>
        </Card>
    )
}