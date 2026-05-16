import { User } from "lucide-react";
import { Button, Input } from "~/components/atoms";
import { Card } from "~/components/molecules";

export function ProfilePage() {
    return (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card title="Hồ sơ người dùng" subtitle="Dùng tabs: Thông tin chung / Email-SĐT / Mật khẩu">
                <div className="flex flex-col items-center rounded-3xl bg-slate-50 p-6 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <User className="h-10 w-10" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">Nguyễn Minh Anh</h3>
                    <p className="text-sm text-slate-500">Chủ nuôi • ID: OW-1023</p>
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline">Đổi ảnh</Button>
                        <Button variant="ghost">Xóa ảnh</Button>
                    </div>
                </div>
            </Card>
            <div className="space-y-6">
                <Card title="Thông tin cá nhân">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Họ tên" value="Nguyễn Minh Anh" />
                        <Input label="Số điện thoại" value="0912 345 678" />
                        <Input label="Email" value="minhanh@email.com" />
                        <Input label="Avatar" value="avatar-minhanh.png" />
                    </div>
                    <div className="mt-5 flex gap-2">
                        <Button>Lưu thay đổi</Button>
                        <Button variant="outline">Hủy</Button>
                    </div>
                </Card>
                <Card title="Cập nhật email / số điện thoại bằng OTP">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Email mới" placeholder="email mới" />
                        <Input label="Số điện thoại mới" placeholder="số điện thoại mới" />
                        <Input label="Mã OTP" placeholder="6 chữ số" />
                        <div className="flex items-end">
                            <Button variant="outline" className="w-full py-3">Gửi OTP</Button>
                        </div>
                    </div>
                </Card>
                <Card title="Thay đổi mật khẩu">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Input label="Mật khẩu cũ" type="password" />
                        <Input label="Mật khẩu mới" type="password" />
                        <Input label="Xác nhận mật khẩu mới" type="password" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
