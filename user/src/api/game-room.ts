import type { CreateRoomType, JoinRoomType } from "@/types/rooms.type";
import { api } from "./axios";

export async function createRoom(data:CreateRoomType) {
    const res = await api.post("/rooms/",data)
    return res.data.data;
}

export async function joinRoom(data:JoinRoomType) {
    const res = await api.post("/rooms/",data)
    return res.data.data;
}

export async function destroyRoom(data:{roomId:string}) {
    const res = await api.post("/rooms/",data)
    return res.data.data;
}

export async function leaveRoom() {
    try { }
    catch { }
}

export async function getRoom() {
    try { }
    catch { }
}

export async function getAllRoomsForGame() {
    try { }
    catch { }
}