export type RoomType = "Thường" | "VIP" | "Cách ly";
export type RoomStatus = "Trống" | "Đang sử dụng" | "Bảo trì";

export interface BoardingRoom {
    id: string;
    code: string;
    name: string;
    type: RoomType;
    capacity: number;
    status: RoomStatus;
    note: string;
    isReferenced?: boolean;
}

export interface RoomSearchParams {
    keyword: string;
    type: RoomType | "";
    status: RoomStatus | "";
    capacity: string;
}

export interface RoomFormValues {
    code: string;
    name: string;
    type: RoomType | "";
    capacity: string;
    status: RoomStatus | "";
    note: string;
}
