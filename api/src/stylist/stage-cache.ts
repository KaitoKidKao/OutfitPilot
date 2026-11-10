// Pre-generated 42 AI Stylist responses (docs/plan.md Step 2 / Task 2):
// 3 occasions x 7 style preferences x 2 locales (en/vi) = 42 combinations.
// Used for stage demo reliability, instant zero-latency responses, and as a
// high-fidelity fallback when the LLM times out or encounters network lag.

import type { OccasionId } from "../catalog.js";
import type { Locale, Recommendation } from "../contract.js";

type StyleMap = Record<string, [Recommendation, Recommendation]>;
type OccasionMap = Partial<Record<OccasionId, StyleMap>>;

export const PREGENERATED_PICKS: Record<Locale, OccasionMap> = {
  vi: {
    job_interview: {
      none: [
        {
          garmentId: "G01",
          reason: "Blazer navy cắt may chỉn chu, chuẩn mực trang trọng cho buổi phỏng vấn tuyển dụng.",
          pairWith: "Quần âu xám than và giày tây da trơn",
        },
        {
          garmentId: "G02",
          reason: "Sơ mi Oxford trắng cổ điển, đem lại diện mạo sáng sủa và lịch thiệp nhẹ nhàng hơn.",
          pairWith: "Quần tây tối màu và thắt lưng da gọn gàng",
        },
      ],
      formal: [
        {
          garmentId: "G01",
          reason: "Blazer navy phom dáng đứng chuẩn mực, tối ưu mức trang trọng 4 cho buổi phỏng vấn.",
          pairWith: "Quần tây may đo tối màu và giày oxford",
        },
        {
          garmentId: "G02",
          reason: "Sơ mi trắng oxford phẳng phiu, lớp trong trang nhã phù hợp phòng phỏng vấn máy lạnh.",
          pairWith: "Quần âu xếp ly và giày da màu đen",
        },
      ],
      smart: [
        {
          garmentId: "G01",
          reason: "Blazer navy lịch lãm, đáp ứng dress code phỏng vấn nhưng không quá cứng nhắc.",
          pairWith: "Quần chinos màu than và giày da nâu sẫm",
        },
        {
          garmentId: "G06",
          reason: "Overshirt be dáng suông lịch sự, phương án thay thế nhẹ nhàng hơn cho phỏng vấn startup.",
          pairWith: "Quần tây ống đứng và giày da tối giản",
        },
      ],
      minimal: [
        {
          garmentId: "G02",
          reason: "Sơ mi Oxford trắng tối giản, đường may tinh tế tạo ấn tượng chuyên nghiệp tin cậy.",
          pairWith: "Quần âu đen tối giản và giày derby trơn",
        },
        {
          garmentId: "G01",
          reason: "Blazer navy màu sắc trung tính, phom đứng kinh điển cho buổi trao đổi trang trọng.",
          pairWith: "Quần âu không ly và thắt lưng da mảnh",
        },
      ],
      casual: [
        {
          garmentId: "G02",
          reason: "Sơ mi Oxford trắng giữ độ lịch thiệp cơ bản nhưng mang lại cảm giác thoải mái.",
          pairWith: "Quần chinos màu be nhạt và giày tây trơn",
        },
        {
          garmentId: "G06",
          reason: "Overshirt màu be nhã nhặn, vừa vặn lịch sự cho môi trường công sở sáng tạo.",
          pairWith: "Quần vải tối màu và giày da đơn giản",
        },
      ],
      street: [
        {
          garmentId: "G02",
          reason: "Sơ mi trắng cổ điển giúp cân bằng dress code lịch thiệp mà vẫn trẻ trung hiện đại.",
          pairWith: "Quần âu cắt ống lửng và giày da đế êm",
        },
        {
          garmentId: "G01",
          reason: "Blazer navy nâng tầm phong cách sắc nét, giữ đúng độ trang trọng của buổi gặp.",
          pairWith: "Quần tây đen dáng suông và giày da trơn",
        },
      ],
      soft: [
        {
          garmentId: "G02",
          reason: "Sơ mi Oxford trắng mềm mại vừa đủ, tạo phong thái nhã nhặn và dễ gần.",
          pairWith: "Quần vải mềm màu trung tính và giày da mờ",
        },
        {
          garmentId: "G03",
          reason: "Áo len dệt màu kem thanh lịch, tuy hơi thoải mái hơn chuẩn nhưng rất ấm áp thân thiện.",
          pairWith: "Quần âu ống đứng và giày mọi đơn giản",
        },
      ],
    },
    campus_day: {
      none: [
        {
          garmentId: "G03",
          reason: "Áo len dệt màu kem mềm mại, độ thoải mái mức 2 lý tưởng cho cả ngày học tập.",
          pairWith: "Quần jeans ống đứng và giày sneaker trắng",
        },
        {
          garmentId: "G04",
          reason: "Áo khoác denim xanh bụi bặm, bền bỉ và tiện lợi cho việc di chuyển ngoài trời.",
          pairWith: "Quần kaki màu cát và giày thể thao năng động",
        },
      ],
      casual: [
        {
          garmentId: "G04",
          reason: "Denim jacket phong cách thường nhật trẻ trung, dễ vận động suốt các tiết học.",
          pairWith: "Quần vải dù hoặc jeans và sneaker đế thấp",
        },
        {
          garmentId: "G03",
          reason: "Áo len kem dệt kim thư thả, giữ ấm tốt trong giảng đường có điều hòa.",
          pairWith: "Quần chinos màu nâu sẫm và giày slip-on",
        },
      ],
      street: [
        {
          garmentId: "G05",
          reason: "Bomber jacket đen phom thể thao gọn nhẹ, đậm chất đường phố và cực kỳ cơ động.",
          pairWith: "Quần túi hộp xám và giày sneaker hầm hố",
        },
        {
          garmentId: "G04",
          reason: "Denim jacket xanh cứng cáp, mang nét cá tính phóng khoáng phù hợp sinh viên.",
          pairWith: "Quần jeans đen rách nhẹ và bốt da thấp cổ",
        },
      ],
      minimal: [
        {
          garmentId: "G05",
          reason: "Bomber đen màu trơn tối giản, dễ phối và giữ vẻ ngoài luôn gọn gàng tinh tươm.",
          pairWith: "Quần kaki đen và giày sneaker trơn màu trắng",
        },
        {
          garmentId: "G03",
          reason: "Áo len kem dệt mịn thanh thoát, tối giản chi tiết nhưng rất có gu.",
          pairWith: "Quần vải thô màu xám và giày vải mộc",
        },
      ],
      soft: [
        {
          garmentId: "G03",
          reason: "Áo len kem chất liệu dệt êm ái, mang lại cảm giác thư thái và diện mạo nhã nhặn.",
          pairWith: "Quần cotton mềm và giày sneaker nhẹ chân",
        },
        {
          garmentId: "G06",
          reason: "Overshirt màu be khoác nhẹ bên ngoài, tone màu đất ấm áp và lịch sự.",
          pairWith: "Quần kaki ống suông và giày lười da lộn",
        },
      ],
      smart: [
        {
          garmentId: "G06",
          reason: "Overshirt be thanh lịch, mang lại diện mạo sinh viên gương mẫu và gọn gàng.",
          pairWith: "Quần chinos màu navy và giày sneaker da sạch",
        },
        {
          garmentId: "G03",
          reason: "Áo len dệt kem trí thức, vừa ấm áp vừa trang nhã trong thư viện.",
          pairWith: "Quần âu dáng lửng và giày derby nhẹ",
        },
      ],
      formal: [
        {
          garmentId: "G06",
          reason: "Overshirt màu be đứng dáng nhất nhóm thường nhật, hợp cho thuyết trình lớp học.",
          pairWith: "Quần chinos tối màu và giày da phong cách thường nhật",
        },
        {
          garmentId: "G02",
          reason: "Sơ mi Oxford trắng tuy hơi trang trọng cho đi học thường ngày nhưng rất sáng sủa.",
          pairWith: "Quần jeans xanh đậm và giày thể thao trơn",
        },
      ],
    },
    coffee_date: {
      none: [
        {
          garmentId: "G06",
          reason: "Overshirt be dáng suông hoàn hảo mức smart casual 3, ấm áp và gần gũi cho buổi hẹn.",
          pairWith: "Quần chinos màu olive và giày da lộn hoặc sneaker",
        },
        {
          garmentId: "G03",
          reason: "Áo len dệt kem màu sắc nhẹ nhàng, tạo thiện cảm và cảm giác dễ chịu cho người đối diện.",
          pairWith: "Quần jeans xanh sẫm và giày lười đơn giản",
        },
      ],
      smart: [
        {
          garmentId: "G06",
          reason: "Overshirt be phối lớp tinh tế, đạt độ chỉn chu lịch thiệp chuẩn gu quán cà phê.",
          pairWith: "Quần chinos màu than và giày derby da lộn",
        },
        {
          garmentId: "G02",
          reason: "Sơ mi Oxford trắng nhã nhặn, tôn vẻ ngoài đĩnh đạc và đáng tin cậy.",
          pairWith: "Quần tây xám sáng và giày lười da nâu",
        },
      ],
      casual: [
        {
          garmentId: "G06",
          reason: "Overshirt be thoải mái, màu sắc trung tính dễ chịu giúp buổi hẹn tự nhiên.",
          pairWith: "Quần jeans ống suông và giày sneaker trắng",
        },
        {
          garmentId: "G04",
          reason: "Denim jacket trẻ trung, tạo điểm nhấn cá tính năng động cho cuộc trò chuyện.",
          pairWith: "Quần kaki đen và giày canvas nhẹ nhàng",
        },
      ],
      soft: [
        {
          garmentId: "G03",
          reason: "Áo len kem dệt thả lỏng ấm áp, tone màu tiếp cận mang lại bầu không khí dịu dàng.",
          pairWith: "Quần nhung tăm màu nâu nhạt và giày lười",
        },
        {
          garmentId: "G06",
          reason: "Overshirt be vải mềm, tạo vẻ ngoài chu đáo và ấm áp trong không gian quán.",
          pairWith: "Quần chinos trắng ngà và giày da nâu ấm",
        },
      ],
      minimal: [
        {
          garmentId: "G05",
          reason: "Bomber jacket đen phom gọn gàng, phong cách tối giản thu hút mà không phô trương.",
          pairWith: "Quần tây ống đứng đen và giày da tối giản",
        },
        {
          garmentId: "G06",
          reason: "Overshirt be cắt may sạch sẽ, điểm nhấn nhẹ nhàng cho buổi hẹn cuối tuần.",
          pairWith: "Quần vải màu trung tính và giày sneaker da trơn",
        },
      ],
      street: [
        {
          garmentId: "G05",
          reason: "Bomber đen phong cách hiện đại, tạo diện mạo cuốn hút và tự tin khi gặp mặt.",
          pairWith: "Quần jeans đen và giày sneaker thời trang",
        },
        {
          garmentId: "G04",
          reason: "Denim jacket sắc xanh cổ điển, thêm chút phong trần cá tính cho buổi cà phê.",
          pairWith: "Quần kaki màu be và bốt da cổ thấp",
        },
      ],
      formal: [
        {
          garmentId: "G06",
          reason: "Overshirt màu be giữ nét lịch sự đứng đắn nhưng không tạo khoảng cách.",
          pairWith: "Quần âu không ly và giày da màu nâu",
        },
        {
          garmentId: "G01",
          reason: "Blazer navy lịch lãm, hơi trang trọng cho quán nước nhưng tạo ấn tượng sâu sắc.",
          pairWith: "Quần chinos màu cát và giày tây đơn giản",
        },
      ],
    },
  },
  en: {
    job_interview: {
      none: [
        {
          garmentId: "G01",
          reason: "Tailored navy blazer hits the target formality 4 required for a job interview.",
          pairWith: "Charcoal tailored trousers and black Oxford shoes",
        },
        {
          garmentId: "G02",
          reason: "Crisp white Oxford shirt offers a clean, approachable alternative for the interview.",
          pairWith: "Dark dress trousers and a classic leather belt",
        },
      ],
      formal: [
        {
          garmentId: "G01",
          reason: "Structured navy blazer provides an impeccable formal profile for high-stakes interviews.",
          pairWith: "Matching tailored trousers and polished leather shoes",
        },
        {
          garmentId: "G02",
          reason: "Classic white Oxford shirt ensures a sharp and respectful interview appearance.",
          pairWith: "Pleated dress trousers and formal leather dress shoes",
        },
      ],
      smart: [
        {
          garmentId: "G01",
          reason: "Navy blazer balances smart sophistication with modern interview dress codes.",
          pairWith: "Slim-fit dark chinos and brown dress shoes",
        },
        {
          garmentId: "G06",
          reason: "Beige overshirt presents a relaxed yet well-groomed alternative for tech interviews.",
          pairWith: "Tailored navy trousers and clean minimalist loafers",
        },
      ],
      minimal: [
        {
          garmentId: "G02",
          reason: "Minimal white Oxford shirt projects pure, understated competence for your interview.",
          pairWith: "Matte black dress pants and clean derby shoes",
        },
        {
          garmentId: "G01",
          reason: "Navy blazer features neutral color and classic lines for an unpretentious smart look.",
          pairWith: "Flat-front grey trousers and a slim belt",
        },
      ],
      casual: [
        {
          garmentId: "G02",
          reason: "White Oxford shirt keeps the interview attire respectable while staying easy-going.",
          pairWith: "Pressed khaki chinos and clean dress shoes",
        },
        {
          garmentId: "G06",
          reason: "Beige overshirt lends a tidy smart casual vibe for relaxed agency interviews.",
          pairWith: "Dark trousers and simple leather slip-ons",
        },
      ],
      street: [
        {
          garmentId: "G02",
          reason: "Crisp white shirt grounds the interview dress code with clean modern energy.",
          pairWith: "Cropped tailored pants and low-profile leather footwear",
        },
        {
          garmentId: "G01",
          reason: "Navy blazer sharpens the overall presence while respecting interview standards.",
          pairWith: "Straight black trousers and smooth monochrome shoes",
        },
      ],
      soft: [
        {
          garmentId: "G02",
          reason: "Soft white cotton shirt creates a warm, respectful and personable interview persona.",
          pairWith: "Soft grey wool trousers and leather shoes",
        },
        {
          garmentId: "G03",
          reason: "Cream knit sweater is gentler than typical blazers, suitable for casual interviews.",
          pairWith: "Tailored chinos and simple smart loafers",
        },
      ],
    },
    campus_day: {
      none: [
        {
          garmentId: "G03",
          reason: "Cream knit sweater delivers comfortable warmth ideal for a campus day.",
          pairWith: "Straight blue jeans and clean white sneakers",
        },
        {
          garmentId: "G04",
          reason: "Durable denim jacket handles campus walking and changing outdoor temperatures.",
          pairWith: "Beige chinos and versatile canvas shoes",
        },
      ],
      casual: [
        {
          garmentId: "G04",
          reason: "Rugged blue denim jacket is the quintessential campus outerwear for effortless layering.",
          pairWith: "Relaxed cargo pants and low sneakers",
        },
        {
          garmentId: "G03",
          reason: "Relaxed cream sweater keeps lecture halls cosy without sacrificing personal style.",
          pairWith: "Dark rinse jeans and casual slip-ons",
        },
      ],
      street: [
        {
          garmentId: "G05",
          reason: "Cropped black bomber delivers athletic streetwear swagger for university grounds.",
          pairWith: "Grey utility trousers and chunky sneakers",
        },
        {
          garmentId: "G04",
          reason: "Boxy denim jacket injects youthful edge into everyday student rotation.",
          pairWith: "Black jeans and low-cut skate shoes",
        },
      ],
      minimal: [
        {
          garmentId: "G05",
          reason: "Clean black bomber features unadorned silhouette perfect for streamlined campus dressing.",
          pairWith: "Black tapered chinos and monochrome white sneakers",
        },
        {
          garmentId: "G03",
          reason: "Cream knit sweater highlights texture over logos for a refined student look.",
          pairWith: "Heather grey trousers and simple canvas shoes",
        },
      ],
      soft: [
        {
          garmentId: "G03",
          reason: "Soft cream knit texture wraps you in comfort across back-to-back classes.",
          pairWith: "Loose cotton pants and cushioned walking shoes",
        },
        {
          garmentId: "G06",
          reason: "Beige overshirt acts as an approachable layer over your favorite inner shirts.",
          pairWith: "Tan corduroy pants and brown suede sneakers",
        },
      ],
      smart: [
        {
          garmentId: "G06",
          reason: "Structured beige overshirt adds a polished collegiate tone for study sessions.",
          pairWith: "Navy chinos and polished white leather sneakers",
        },
        {
          garmentId: "G03",
          reason: "Cream knit sweater provides studious charm for library time and presentations.",
          pairWith: "Tailored ankle pants and smart casual shoes",
        },
      ],
      formal: [
        {
          garmentId: "G06",
          reason: "Neat beige overshirt strikes the smartest silhouette within casual student bounds.",
          pairWith: "Dark flat-front trousers and clean dress sneakers",
        },
        {
          garmentId: "G02",
          reason: "White Oxford shirt is slightly formal for class but sharp for faculty meetings.",
          pairWith: "Dark indigo jeans and brown leather shoes",
        },
      ],
    },
    coffee_date: {
      none: [
        {
          garmentId: "G06",
          reason: "Beige overshirt offers relaxed smartness with welcoming neutral tones for a coffee date.",
          pairWith: "Olive chinos and suede loafers or sneakers",
        },
        {
          garmentId: "G03",
          reason: "Cream knit sweater conveys easy-going warmth and approachable charm across the table.",
          pairWith: "Dark slim jeans and neat low sneakers",
        },
      ],
      smart: [
        {
          garmentId: "G06",
          reason: "Layered beige overshirt brings thoughtful attention to detail for an afternoon date.",
          pairWith: "Charcoal chinos and rich suede desert boots",
        },
        {
          garmentId: "G02",
          reason: "Classic white Oxford shirt radiates considerate effort and effortless charm.",
          pairWith: "Light grey trousers and clean leather loafers",
        },
      ],
      casual: [
        {
          garmentId: "G06",
          reason: "Relaxed beige overshirt keeps the date atmosphere light, comfortable and fun.",
          pairWith: "Straight-cut denim and classic white sneakers",
        },
        {
          garmentId: "G04",
          reason: "Blue denim jacket provides a timeless casual layer for weekend coffee strolls.",
          pairWith: "Black chinos and retro canvas sneakers",
        },
      ],
      soft: [
        {
          garmentId: "G03",
          reason: "Cosy cream knitwear creates an intimate, inviting ambiance for deep conversations.",
          pairWith: "Warm tan trousers and minimal leather shoes",
        },
        {
          garmentId: "G06",
          reason: "Soft beige overshirt flatters natural light in cosy café corners.",
          pairWith: "Off-white chinos and soft suede loafers",
        },
      ],
      minimal: [
        {
          garmentId: "G05",
          reason: "Sleek black bomber exudes confident minimalism without trying too hard.",
          pairWith: "Black tapered trousers and clean minimalist sneakers",
        },
        {
          garmentId: "G06",
          reason: "Beige overshirt presents a clean uncluttered aesthetic for casual dates.",
          pairWith: "Neutral trousers and monochromatic leather shoes",
        },
      ],
      street: [
        {
          garmentId: "G05",
          reason: "Cropped black bomber delivers contemporary flair for lively inner-city café dates.",
          pairWith: "Slim black jeans and stylish sneakers",
        },
        {
          garmentId: "G04",
          reason: "Classic denim jacket brings authentic character and confidence to your meetup.",
          pairWith: "Khaki chinos and low leather sneakers",
        },
      ],
      formal: [
        {
          garmentId: "G06",
          reason: "Beige overshirt keeps formality in check while looking sharp and intentional.",
          pairWith: "Wool-blend trousers and brown leather shoes",
        },
        {
          garmentId: "G01",
          reason: "Navy blazer turns heads; slightly formal for coffee but unmistakably stylish.",
          pairWith: "Sand chinos and refined casual loafers",
        },
      ],
    },
  },
};

export function getPregeneratedPicks(
  occasionId: OccasionId,
  style: string,
  locale: Locale,
): [Recommendation, Recommendation] | null {
  const byLocale = PREGENERATED_PICKS[locale] ?? PREGENERATED_PICKS.en;
  const byOccasion = byLocale[occasionId];
  if (!byOccasion) return null;
  const picks = byOccasion[style] ?? byOccasion.none;
  return picks ?? null;
}
