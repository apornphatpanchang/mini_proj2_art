import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const COURSE = 'CS319 Section 427A';

//เก็บลิงก์แหล่งอ้างอิงข้อมูลและภาพผลงาน
const DATA_SOURCES = [
  {
    label: 'MoMA — The Starry Night',
    url: 'https://www.moma.org/collection/works/79802',
  },
  {
    label: "O'Rourke's — Sorrowing Old Man",
    url: 'https://orourkes.omeka.net/items/show/165',
  },
  {
    label: 'Mauritshuis — Girl with a Pearl Earring',
    url: 'https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring',
  },
  {
    label: 'Google Arts & Culture — Self-Portrait',
    url: 'https://artsandculture.google.com/usergallery/3QICr9GygCTCLQ',
  },
  {
    label: 'Encyclopaedia Britannica — Mona Lisa',
    url: 'https://www.britannica.com/topic/Mona-Lisa-painting',
  },
  {
    label: 'Google Arts & Culture — Portrait of a Lady',
    url: 'https://artsandculture.google.com/story/botticelli-special-exhibition-la-bella-simonetta-marubeni-gallery/5wVR7o33wHPuCQ?hl=en',
  },
  {
    label: 'Cenacolo Vinciano — The Last Supper',
    url: 'https://cenacolovinciano.org/en/museum/the-works/the-last-supper-leonardo-da-vinci-1452-1519/',
  },
  {
    label: 'Kröller-Müller Museum — Café Terrace at Night',
    url: 'https://www.krollermuller.nl/en/collection/vincent-van-gogh-terrace-of-a-caf-at-night-place-du-forum-km-108-565',
  },
  {
    label: 'Van Gogh Museum — Vase with Irises Against a Yellow Background (1890)',
    url: 'https://www.vangoghmuseum.nl/en/collection/s0050V1962',
  },
  {
    label: 'History X Site — The Last Judgment',
    url: 'https://historyxsite.wordpress.com/2017/09/24/%E0%B9%80%E0%B8%A3%E0%B8%99%E0%B8%B2%E0%B8%8B%E0%B9%87%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B9%8C-%E0%B8%A2%E0%B8%B8%E0%B8%84%E0%B8%AA%E0%B8%A1%E0%B8%B1%E0%B8%A2%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%81/',
  },
  {
    label: 'National Museum in Kraków — Lady with an Ermine',
    url: 'https://mnk.pl/en/collections/lady-with-an-ermine/',
  },
  {
    label: 'Fine Art Prints on Demand — Sunflowers',
    url: 'https://www.fineartprintsondemand.com/artists/van_gogh/sunflowers_1888.htm',
  },
  {
    label: 'LeonardoDaVinci.net — The Virgin and Child with Saint Anne',
    url: 'https://www.leonardodavinci.net/the-virgin-and-child-with-saint-anne.jsp',
  },
  {
    label: 'MUNCH — The Scream',
    url: 'https://www.munch.no/en/our-collection/5-things-you-should-know-about-the-scream/',
  },
  {
    label: 'Artsy — The Virgin of the Rocks',
    url: 'https://www.artsy.net/artwork/leonardo-da-vinci-virgin-of-the-rocks',
  },
  {
    label: 'Art Institute of Chicago — The Old Guitarist',
    url: 'https://www.artic.edu/artworks/28067/the-old-guitarist',
  },
  {
    label: 'MoMA — Girl Before a Mirror',
    url: 'https://www.moma.org/collection/works/78311',
  },
  {
    label: "Christie's — Green Leaves and Bust",
    url: 'https://www.christies.com/lot/lot-5313319',
  },
  {
    label: 'Tate — The Weeping Woman',
    url: 'https://www.tate.org.uk/art/artworks/picasso-weeping-woman-t05010',
  },
  {
    label: 'Barnes Foundation — Acrobat and Young Harlequin',
    url: 'https://collection.barnesfoundation.org/objects/5878/Acrobat-and-Young-Harlequin-(Acrobate-et-jeune-Arlequin)/',
  },
];


//เก็บเว็บไซต์อ้างอิงด้านการออกแบบ
const DESIGN_REFS = [
  { label: 'Galleria slideshow site', url: 'https://galleria-slideshow-site-wa.netlify.app/' },
  { label: 'Freya Template (ThemeWagon)', url: 'https://prium.github.io/freya/v2.2.0/' },
];

interface LinkItem {
  label: string;
  url: string;
}


function splitLabel(item: LinkItem): { eyebrow: string; title: string } {
  const [museum, ...rest] = item.label.split(' — ');
  if (rest.length > 0) return { eyebrow: museum, title: rest.join(' — ') };
  return { eyebrow: new URL(item.url).hostname.replace('www.', ''), title: item.label };
}

function LinkGroup({
  title,
  caption,
  items,
}: {
  title: string;
  caption?: string;
  items: LinkItem[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="font-serif font-bold text-lg text-neutral-900">{title}</h3>
        {caption && <span className="text-xs text-neutral-400">{caption}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((s) => {
          const { eyebrow, title: name } = splitLabel(s);
          return (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-3 bg-[#F8F8F9] hover:bg-white border border-transparent hover:border-neutral-200 hover:shadow-md hover:-translate-y-0.5 rounded-2xl px-4 py-3 transition-all duration-200"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-neutral-400 truncate">
                  {eyebrow}
                </p>
                <p className="text-sm font-bold text-neutral-900 leading-snug mt-0.5">{name}</p>
              </div>
              <span className="shrink-0 w-8 h-8 rounded-full bg-white group-hover:bg-black group-hover:text-white text-neutral-500 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}


interface Member {
  photo: string | null; 
  name: string;
  nickname: string;
  studentId: string;
  duties: { page: string; detail: string }[]; 
  tint: string; 
}

const members: Member[] = [
  {
    photo: '/images/team/Kasira.png',
    name: 'นางสาวกษิรา สาริมานนท์',
    nickname: 'อุ้ม',
    studentId: '1660701234',
    duties: [
      { page: 'Home', detail: 'แสดงภาพผลงานต่างๆ จำนวน 20 ภาพ และสามารถทำให้กดหัวใจเพื่อบันทึกเข้า My Collection ได้' },
      {
        page: 'Artwork Detail',
        detail:
          'กดภาพเพื่อดูรายละเอียดผลงาน ได้แก่ ชื่อผลงาน ศิลปิน ปีที่สร้าง เทคนิค ขนาด และเรื่องราวของผลงาน พร้อมปุ่มบันทึกเข้า My Collection',
      },
      { page: 'My Collection', detail: 'รวมผลงานทั้งหมดที่ผู้ใช้กดบันทึกไว้ และสามารถลบออกได้' },
    ],
    tint: 'from-emerald-100 to-teal-200',
  },
  {
    photo: '/images/team/Apornphat.jpg',
    name: 'นางสาวอาภรณ์ภัทร์ ปานช้าง',
    nickname: 'หวาย',
    studentId: '1660701473',
    duties: [
      { page: 'Home', detail: 'เพิ่มช่องค้นหาผลงาน' },
      { page: 'Artwork Detail', detail: 'เพิ่มปุ่มเพิ่มเข้านิทรรศการ' },
      {
        page: 'My Collection',
        detail: 'เมื่อกดลูกศรก่อนหน้า/ถัดไป จะดูได้เฉพาะภาพที่อยู่ใน My Collection เท่านั้น',
      },
      { page: 'About', detail: 'Design ใส่ข้อมูลของสมาชิก และ ใส่ข้อมูลแหล่งอ้างอิง' },
    ],
    tint: 'from-indigo-100 to-violet-200',
  },
  {
    photo: '/images/team/Kanyanat.jpg',
    name: 'นางสาวกัญญาณัฐ สุดเชยชม',
    nickname: 'นิด',
    studentId: '1660700947',
    duties: [
      {
        page: 'Exhibition',
        detail:
          'สร้างนิทรรศการของตัวเอง ตั้งชื่อ เขียนคำอธิบาย เลือกผลงานจาก Collection มาใส่ แล้วลากเรียงลำดับ และมีโหมดสไลด์โชว์เต็มจอให้ "เดินชม" นิทรรศการที่สร้างเอง',
      },
    ],
    tint: 'from-amber-100 to-orange-200',
  },
];


function PhotoArea({ member }: { member: Member }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = member.photo && !failed;

  
  return (
    <div
      className={`relative h-72 overflow-hidden ${
        showPhoto ? 'bg-white' : `bg-gradient-to-b ${member.tint}`
      }`}
    >
      {showPhoto ? (
        <img
          src={`${member.photo}?v=2`}
          alt={member.name}
          onError={() => {
            console.error('โหลดรูปไม่ได้:', member.photo);
            setFailed(true);
          }}
          className="h-full w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-105 origin-bottom"
        />
      ) : (
        <div className="h-full flex items-center justify-center text-8xl font-serif font-bold text-white/80 drop-shadow">
          {member.nickname.charAt(0)}
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="pb-10">
      
      <div className="text-center mt-6 mb-10">
        <h1 className="text-4xl  font-serif font-bold tracking-tight text-neutral-900">
          Developed by
        </h1>
        <div className="w-14 h-1 bg-black rounded-full mx-auto mt-3" />
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((m) => {
          const rows = [
            { label: 'ชื่อ-สกุล', value: m.name },
            { label: 'ชื่อเล่น', value: m.nickname },
            { label: 'รหัสนักศึกษา', value: m.studentId },
            { label: 'รายวิชา', value: COURSE },
          ];

          return (
            <div
              key={m.studentId}
              className="group bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <PhotoArea member={m} />

              <div className="p-5 flex-1 flex flex-col gap-5">
                
                <div className="bg-[#F8F8F9] rounded-xl p-5 space-y-3 text-xs text-neutral-700">
                  {rows.map((r, i) => (
                    <div
                      key={r.label}
                      className={`flex justify-between items-center gap-4 py-1 ${
                        i < rows.length - 1 ? 'border-b border-neutral-200/60' : ''
                      }`}
                    >
                      <span className="text-neutral-500 font-medium shrink-0">{r.label}</span>
                      <span className="font-semibold text-neutral-900 text-right">{r.value}</span>
                    </div>
                  ))}
                </div>

                              {/* หน้าที่ความรับผิดชอบ */}
                <div className="text-left">
                  <h4 className="font-bold text-base text-neutral-900 mb-3">หน้าที่</h4>
                  <ul className="space-y-3">
                    {m.duties.map((d) => (
                      <li key={d.page} className="flex gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-neutral-900">{d.page}</p>
                          <p className="text-[13px] font-medium text-neutral-700 leading-relaxed mt-0.5">
                            {d.detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
            
       
      <div className="mt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">
            แหล่งอ้างอิง
          </h2>
          <div className="w-14 h-1 bg-black rounded-full mx-auto mt-3" />
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 md:p-8 space-y-10">
          <LinkGroup
            title="แหล่งที่มาของข้อมูลและภาพผลงาน"
            caption={`${DATA_SOURCES.length} แหล่ง`}
            items={DATA_SOURCES}
          />
          <LinkGroup title="แรงบันดาลใจด้านการออกแบบ" items={DESIGN_REFS} />
        </div>
      </div>

    </div>
  );
}