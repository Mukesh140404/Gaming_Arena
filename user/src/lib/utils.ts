import { leaveRoomApi,destroyRoomApi } from "@/api/room";
import { useCurrentUser } from "@/hooks/useAuth";
import { useContext } from "react";

export const onLeaveRoomLobby = async (roomId: string,userId:string) => {
   try {
    const user = useCurrentUser()
    const room = use 
    await leaveRoomApi(roomId);
  } catch (error) {
    console.log("Error while leaving room", error);
  }
}