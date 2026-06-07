import { Building2, CalendarDays, ClipboardCheck, Sparkles } from "lucide-react";
import { Tag } from "~/components/atoms";
import { Card, DataTable, MiniGridStats } from "~/components/molecules";
import { today, useReceptionMockData } from "../mockReceptionData";

const appointmentTone = (status: string) => {
    if (status === "Đang chờ khám") return "blue" as const;
    if (status === "Đã hủy") return "red" as const;
    return "amber" as const;
};

export function ReceptionDashboard() {
    const { appointments, groomingTickets, boardingPets, boardingLogs } = useReceptionMockData();

    const waitingAppointments = appointments.filter((item) => item.status === "Chờ tiếp nhận").length;
    const activeBoardingPets = boardingPets.filter((pet) => pet.status === "Đang lưu trú" || pet.status === "Sắp đón").length;
    const todaySavedLogs = boardingLogs.filter((log) => log.date === today && log.status === "Đã lưu").length;
    const processingGrooming = groomingTickets.filter((ticket) => ticket.status === "Đang dùng dịch vụ").length;

    return (
        <div className="space-y-6">
            <MiniGridStats
                items={[
                    {
                        label: "Lịch hẹn hôm nay",
                        value: "24",
                        hint: "5 lịch chưa tiếp nhận",
                        icon: CalendarDays,
                    },
                    {
                        label: "Spa trong ngày",
                        value: "13",
                        hint: "4 thú cưng đang phục vụ",
                        icon: Sparkles,
                    },
                    {
                        label: "Đang lưu trú",
                        value: "18",
                        hint: "3 nhật ký chưa cập nhật",
                        icon: Building2,
                    },
                    {
                        label: "Khách chờ tại quầy",
                        value: "4",
                        hint: "1 ca cần tạo nhanh",
                        icon: Users,
                    },
                ]}
            />
            <Card title="Bảng điều phối nhanh" subtitle="Tổng hợp nhanh các ca đang có trong các màn hình nghiệp vụ của nhân viên trung tâm.">
                <DataTable
                    columns={[
                        "Khung giờ",
                        "Khách",
                        "Thú cưng",
                        "Dịch vụ",
                        "Trạng thái",
                        "Hành động",
                    ]}
                    rows={[
                        [
                            "09:00",
                            "Nguyễn Minh",
                            "Milu",
                            "Khám bệnh",
                            <Tag tone="amber">Chờ tiếp nhận</Tag>,
                            "Tiếp nhận",
                        ],
                        [
                            "09:30",
                            "Lê Hà",
                            "Mít",
                            "Spa",
                            <Tag tone="blue">Đang phục vụ</Tag>,
                            "Xem",
                        ],
                        [
                            "10:00",
                            "Hoàng Lan",
                            "Bơ",
                            "Lưu trú",
                            <Tag tone="green">Đã check-in</Tag>,
                            "Xem",
                        ],
                    ]}
                />
            </Card>
        </div>
    );
}
