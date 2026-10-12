import { destroyRoomApi, fetchRoomById, leaveRoomApi } from "@/api/room"

export { cn } from "cn"

export const onLeaveRoomLobby = async (
    roomId: string,
    userId: string
) => {
    const room = await fetchRoomById(roomId)

    if (!room) return

    if (room.hostId === userId) {
        destroyRoomApi(roomId)
    } else {
        leaveRoomApi(roomId)
        
    }
}