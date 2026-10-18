// การ์ดโครงร่าง (Skeleton) ใช้แสดงระหว่างรอโหลดข้อมูลผลงานศิลปะ
// รับความสูงแบบสุ่มเพื่อให้เข้ากับ Masonry layout จริง
export default function SkeletonCard({ height = 260 }: { height?: number }) {
  return (
    <div
      className="mb-4 rounded bg-neutral-200 animate-pulse"
      style={{ height }}
    />
  );
}
