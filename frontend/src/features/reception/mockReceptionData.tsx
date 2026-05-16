import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from "react";

export type AppointmentStatus = "Chờ tiếp nhận" | "Đang chờ khám" | "Đã hủy";

export type Appointment = {
    id: string;
    time: string;
    customerName: string;
    phone: string;
    petName: string;
    doctor: string;
    service: string;
    symptom: string;
    status: AppointmentStatus;
    note?: string;
};

export type GroomingStatus = "Chờ làm" | "Đang dùng dịch vụ" | "Hoàn thành";

export type GroomingTicket = {
    id: string;
    petName: string;
    ownerName: string;
    service: string;
    time: string;
    status: GroomingStatus;
    note?: string;
    updatedAt: string;
    popupSent?: boolean;
    warning?: string;
};

export type Session = "Sáng" | "Trưa" | "Chiều";
export type MealStatus = "Ăn tốt" | "Ăn ít" | "Bỏ ăn";
export type HygieneStatus = "Bình thường" | "Theo dõi thêm" | "Bất thường";
export type LogStatus = "Đã lưu" | "Nháp";

export type BoardingPet = {
    id: string;
    cage: string;
    petName: string;
    ownerName: string;
    dayText: string;
    status: "Đang lưu trú" | "Sắp đón";
};

export type BoardingLog = {
    id: string;
    petId: string;
    date: string;
    session: Session;
    mealStatus: MealStatus;
    hygieneStatus: HygieneStatus;
    files: string[];
    note: string;
    status: LogStatus;
    createdAt: string;
    editable: boolean;
};

export const today = "12/04/2026";

export const appointmentDoctorOptions = ["Hệ thống tự gán", "BS. Trần Gia An", "BS. Phạm Thu Hương", "BS. Nguyễn Minh Phúc"];
export const appointmentStatusOptions = ["Tất cả trạng thái", "Chờ tiếp nhận", "Đang chờ khám", "Đã hủy"];
export const appointmentServiceOptions = ["Khám tổng quát", "Khám da liễu", "Khám tiêu hóa", "Tiêm phòng"];
export const appointmentTimeSlotOptions = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

export const groomingStatusOptions: GroomingStatus[] = ["Chờ làm", "Đang dùng dịch vụ", "Hoàn thành"];
export const groomingServiceOptions = ["Tắm + Sấy", "Cắt móng", "Spa premium", "Cắt tỉa lông", "Vệ sinh tai", "Tắm thuốc"];
export const groomingTimeSlotOptions = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

export const boardingSessionOptions: Session[] = ["Sáng", "Trưa", "Chiều"];
export const boardingMealOptions: MealStatus[] = ["Ăn tốt", "Ăn ít", "Bỏ ăn"];
export const boardingHygieneOptions: HygieneStatus[] = ["Bình thường", "Theo dõi thêm", "Bất thường"];
export const boardingStatusOptions: BoardingPet["status"][] = ["Đang lưu trú", "Sắp đón"];

const initialAppointments: Appointment[] = [
    {
        id: "AP0001",
        time: "09:00",
        customerName: "Nguyễn Minh Anh",
        phone: "0912 456 888",
        petName: "Milu",
        doctor: "BS. Trần Gia An",
        service: "Khám tổng quát",
        symptom: "Bỏ ăn 2 ngày, hơi lờ đờ",
        status: "Chờ tiếp nhận",
    },
    {
        id: "AP0002",
        time: "09:30",
        customerName: "Lê Thanh Hà",
        phone: "0909 145 336",
        petName: "Mít",
        doctor: "BS. Phạm Thu Hương",
        service: "Tiêm phòng",
        symptom: "Tiêm nhắc lại theo lịch",
        status: "Đang chờ khám",
    },
    {
        id: "AP0003",
        time: "10:00",
        customerName: "Hoàng Ngọc Lan",
        phone: "0933 778 990",
        petName: "Bơ",
        doctor: "BS. Trần Gia An",
        service: "Khám da liễu",
        symptom: "Ngứa vùng cổ, rụng lông",
        status: "Đã hủy",
    },
    {
        id: "AP0004",
        time: "10:30",
        customerName: "Trần Quốc Huy",
        phone: "0988 332 101",
        petName: "Đốm",
        doctor: "BS. Nguyễn Minh Phúc",
        service: "Khám tiêu hóa",
        symptom: "Nôn sau ăn, đi ngoài lỏng",
        status: "Chờ tiếp nhận",
    },
];

const initialGroomingTickets: GroomingTicket[] = [
    { id: "SPA102", petName: "Milu", ownerName: "Nguyễn Minh Anh", service: "Tắm + Sấy", time: "09:00", status: "Chờ làm", updatedAt: "08:55" },
    { id: "SPA103", petName: "Luna", ownerName: "Phan Linh", service: "Cắt móng", time: "09:30", status: "Chờ làm", updatedAt: "09:05" },
    { id: "SPA104", petName: "Mít", ownerName: "Lê Thanh Hà", service: "Spa premium", time: "10:00", status: "Đang dùng dịch vụ", updatedAt: "10:15" },
    { id: "SPA105", petName: "Bơ", ownerName: "Hoàng Ngọc Lan", service: "Cắt tỉa lông", time: "10:30", status: "Hoàn thành", updatedAt: "10:35", popupSent: true },
];

const initialBoardingPets: BoardingPet[] = [
    { id: "BP001", cage: "C12", petName: "Milu", ownerName: "Nguyễn Minh Anh", dayText: "Ngày 2/3", status: "Đang lưu trú" },
    { id: "BP002", cage: "B03", petName: "Bơ", ownerName: "Hoàng Ngọc Lan", dayText: "Ngày 1/2", status: "Đang lưu trú" },
    { id: "BP003", cage: "A08", petName: "Mít", ownerName: "Lê Thanh Hà", dayText: "Ngày 4/5", status: "Sắp đón" },
];

const initialBoardingLogs: BoardingLog[] = [
    {
        id: "LT0001",
        petId: "BP001",
        date: today,
        session: "Sáng",
        mealStatus: "Ăn tốt",
        hygieneStatus: "Bình thường",
        files: ["milu_sang.jpg"],
        note: "Ăn hết khẩu phần, tinh thần ổn định.",
        status: "Đã lưu",
        createdAt: "08:15",
        editable: true,
    },
    {
        id: "LT0002",
        petId: "BP003",
        date: today,
        session: "Sáng",
        mealStatus: "Ăn ít",
        hygieneStatus: "Theo dõi thêm",
        files: ["mit_sang.mp4"],
        note: "Hơi ít vận động, cần theo dõi thêm buổi trưa.",
        status: "Đã lưu",
        createdAt: "08:40",
        editable: true,
    },
    {
        id: "LT0000",
        petId: "BP001",
        date: "11/04/2026",
        session: "Chiều",
        mealStatus: "Ăn tốt",
        hygieneStatus: "Bình thường",
        files: ["milu_chieu_cu.jpg"],
        note: "Bài hôm qua chỉ hiển thị, không được sửa/xóa.",
        status: "Đã lưu",
        createdAt: "16:35",
        editable: false,
    },
];

type ReceptionMockContextValue = {
    appointments: Appointment[];
    setAppointments: Dispatch<SetStateAction<Appointment[]>>;
    groomingTickets: GroomingTicket[];
    setGroomingTickets: Dispatch<SetStateAction<GroomingTicket[]>>;
    boardingPets: BoardingPet[];
    setBoardingPets: Dispatch<SetStateAction<BoardingPet[]>>;
    boardingLogs: BoardingLog[];
    setBoardingLogs: Dispatch<SetStateAction<BoardingLog[]>>;
};

const ReceptionMockContext = createContext<ReceptionMockContextValue | null>(null);

export function ReceptionMockProvider({ children }: { children: ReactNode }) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [groomingTickets, setGroomingTickets] = useState<GroomingTicket[]>(initialGroomingTickets);
    const [boardingPets, setBoardingPets] = useState<BoardingPet[]>(initialBoardingPets);
    const [boardingLogs, setBoardingLogs] = useState<BoardingLog[]>(initialBoardingLogs);

    return (
        <ReceptionMockContext.Provider
            value={{
                appointments,
                setAppointments,
                groomingTickets,
                setGroomingTickets,
                boardingPets,
                setBoardingPets,
                boardingLogs,
                setBoardingLogs,
            }}
        >
            {children}
        </ReceptionMockContext.Provider>
    );
}

export function useReceptionMockData() {
    const context = useContext(ReceptionMockContext);

    if (!context) {
        throw new Error("useReceptionMockData must be used inside ReceptionMockProvider");
    }

    return context;
}
