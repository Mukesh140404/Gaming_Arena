// import type { CreateRoomType, JoinRoomType } from "@/types/rooms.type";
// import { api } from "./axios";

// export async function createRoom(data:CreateRoomType) {
//     const res = await api.post("/rooms/",data)
//     return res.data.data;
// }

// export async function joinRoom(data:JoinRoomType) {
//     const res = await api.post("/rooms/join",data)
//     return res.data.data;
// }

// export async function destroyRoom(data:{roomId:string}) {
//     const res = await api.get(`/rooms/destroy/${data.roomId}`)
//     return res.data.data;
// }

// export async function leaveRoom(data:{roomId:string}) {
//     const res = await api.get(`/rooms/leave/${data.roomId}`)
//     return res.data.data;
// }

// export async function getRoom(data:{roomId:string}) {
//     const res = await api.get(`/rooms/${data.roomId}`)
//     return res.data.data;
// }

// export async function getAllRoomsForGame(data:{gameId:string}) {
//     const res = await api.get(`/rooms/game/${data.gameId}`)
//     return res.data.data;
// }   