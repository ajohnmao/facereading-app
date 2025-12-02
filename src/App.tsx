import React, { useState, useCallback, ChangeEvent, DragEvent, useRef, useEffect } from 'react';

// --- Type Definitions ---

type Language = 'zh-TW' | 'en' | 'ja';
type MapMode = 'palaces' | 'ages'; // 12 Palaces or Yearly Luck
type AppMode = 'single' | 'couple' | 'daily' | 'aging' | 'career2026' | 'mirror';

interface Translation {
  title: string;
  subtitle: string;
  desc_start: string;
  desc_highlight: string;
  desc_end: string;
  desc_sub: string;
  tabs: {
    single: string;
    couple: string;
    daily: string;
    aging: string;
    career2026: string;
    mirror: string;
  };
  books: {
    mayi: { title: string; desc: string; details: string };
    liuzhuang: { title: string; desc: string; details: string };
    shuijing: { title: string; desc: string; details: string };
    bingjian: { title: string; desc: string; details: string };
  };
  upload: {
    title: string;
    ready: string;
    camera: string;
    file: string;
    hint: string;
    error_type: string;
    error_read: string;
    error_empty: string;
  };
  couple: {
    p1_label: string;
    p2_label: string;
    upload_hint: string;
    analyze_btn: string;
    match_score: string;
    result_title: string;
  };
  daily: {
    title: string;
    subtitle: string;
    analyze_btn: string;
    energy_level: string;
    health_tip: string;
    fortune_tip: string;
  };
  aging: {
    title: string;
    subtitle: string;
    path_virtue: string;
    path_worry: string;
    btn_simulate: string;
    result_title: string;
    virtue_desc: string;
    worry_desc: string;
  };
  career2026: {
    title: string;
    subtitle: string;
    analyze_btn: string;
    trend_title: string;
    job_title: string;
    ancient_logic: string;
    future_logic: string;
  };
  mirror: {
    title: string;
    subtitle: string;
    analyze_btn: string;
    inner_label: string;
    outer_label: string;
    upload_hint: string;
    result_title: string;
    concept_title: string;
    concept_desc: string;
    left_face_title: string;
    left_face_desc: string;
    right_face_title: string;
    right_face_desc: string;
    visual_shock_title: string;
    visual_shock_desc: string;
    align_title: string;
    align_desc: string;
    confirm_align: string;
    cancel_align: string; 
  };
  map: {
    title: string;
    mode_palace: string;
    mode_age: string;
    hint: string;
    guide: string;
    select_prompt: string;
    ar_tooltip: string; 
    bg_character: string; 
  };
  diagrams: {
    title: string;
    subtitle: string;
    fig1: {
      title: string;
      core_logic: string;
      points: string[];
    };
    fig2: {
      title: string;
      core_logic: string;
      points: string[];
    };
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: {
      step1: { title: string; desc: string };
      step2: { title: string; desc: string };
      step3: { title: string; desc: string };
      step4: { title: string; desc: string };
    };
  };
  encyclopedia: {
    title: string;
    subtitle: string;
    palaces_title: string;
    palaces: {
      ming: string;
      cai: string;
      guan: string;
      tian: string;
      nannv: string;
      qiqie: string;
      xiongdi: string;
      jie: string;
      qianyi: string;
      nupu: string;
      fude: string;
      xiangmao: string;
    };
  };
  analysis: {
    btn_start: string;
    btn_loading: string;
    title: string;
    disclaimer: string;
    error_prefix: string;
  };
  ai_prompt_lang: string;
}

// --- Localization Data ---

const TRANSLATIONS: Record<Language, Translation> = {
  'zh-TW': {
    title: "AI 古籍面相大師",
    subtitle: "AI Ancient Physiognomy Master",
    desc_start: "匯聚",
    desc_highlight: "四大相學聖典",
    desc_end: "精髓，\n為您解析五官氣色，洞悉命理玄機。",
    desc_sub: "Synthesizing the Four Classics of Physiognomy to unveil the secrets of your destiny.",
    tabs: {
      single: "個人運勢",
      couple: "情侶合盤",
      daily: "每日氣色",
      aging: "AI 時光機",
      career2026: "2026 未來職涯",
      mirror: "陰陽顯影鏡"
    },
    books: {
      mayi: { title: "麻衣相法", desc: "流年與十二宮", details: "相學之首，以「十二宮」定位命運區塊，並以「流年圖」推算由幼至老的一生運勢流轉。" },
      liuzhuang: { title: "柳莊相法", desc: "五嶽與氣色", details: "補足靜態不足，以「五嶽四瀆」論格局高低，專注「氣色」變化判斷當下吉凶。" },
      shuijing: { title: "水鏡相法", desc: "識人忠奸", details: "實用主義經典，快速分辨「忠奸賢愚」，教你如何在職場與社交中精準識人。" },
      bingjian: { title: "冰鑑", desc: "神骨氣態", details: "曾國藩心法，觀「神骨氣態」，洞悉人的內在精神格局與未來發展潛力。" }
    },
    upload: {
      title: "上傳面部照片",
      ready: "照片已就緒，可更換",
      camera: "立即拍照",
      file: "相冊上傳",
      hint: "請確保光線充足、五官清晰的正臉照 (JPG/PNG)",
      error_type: "請上傳有效的圖片文件 (JPG/PNG)。",
      error_read: "文件讀取失敗，請確認檔案格式。",
      error_empty: "請先上傳您的面部照片。"
    },
    couple: {
      p1_label: "一方 (男/女)",
      p2_label: "另一方 (男/女)",
      upload_hint: "請分別上傳兩人的正面清晰照片",
      analyze_btn: "開始合盤分析",
      match_score: "緣分契合度",
      result_title: "雙人合盤報告"
    },
    daily: {
      title: "每日氣色健康掃描",
      subtitle: "Daily Qi/Health Scan",
      analyze_btn: "掃描今日氣色",
      energy_level: "今日能量指數",
      health_tip: "🌿 健康與養生建議",
      fortune_tip: "🍀 今日運勢提醒"
    },
    aging: {
      title: "AI 運勢時光機",
      subtitle: "相由心生：預見 10 年後的自己",
      path_virtue: "✨ 修身養性之路",
      path_worry: "🌪️ 勞碌操心之路",
      btn_simulate: "開始時光模擬",
      result_title: "未來面相預測報告",
      virtue_desc: "若您保持樂觀、行善積德，面相將如何轉化...",
      worry_desc: "若您持續焦慮、過度操勞，面相恐將出現..."
    },
    career2026: {
      title: "2026 未來職涯雷達",
      subtitle: "古法面相 × 全球趨勢分析",
      analyze_btn: "預測我的未來職業",
      trend_title: "2026 全球趨勢關鍵字",
      job_title: "您的天命職業",
      ancient_logic: "📜 古籍依據 (根)",
      future_logic: "🚀 未來趨勢 (花)"
    },
    mirror: {
      title: "AI 陰陽顯影鏡",
      subtitle: "揭開左右臉不對稱的靈魂秘密",
      analyze_btn: "分析靈魂反差",
      inner_label: "內在真實臉 (左臉/先天)",
      outer_label: "外在社會臉 (右臉/後天)",
      upload_hint: "請上傳正面照，AI 將自動裂變分析",
      result_title: "靈魂反差診斷書",
      concept_title: "核心概念：為什麼要看左右臉？",
      concept_desc: "大多數人不知道，人的左臉與右臉代表著截然不同的意義。我們利用 AI 鏡像技術，揭示您未曾見過的「潛意識自我」與「社會化面具」。",
      left_face_title: "左臉 (內在/過去)",
      left_face_desc: "受右腦控制，掌管情緒、直覺、潛意識與祖蔭。這是「真實的你」。",
      right_face_title: "右臉 (外在/未來)",
      right_face_desc: "受左腦控制，掌管理性、邏輯、社會化與後天修煉。這是「社會的你」。",
      visual_shock_title: "視覺衝擊與心理分析",
      visual_shock_desc: "當這兩張臉差異巨大時，代表您的內在與外在存在衝突或高度社會化；若差異微小，則代表表裡如一。AI 將為您深度解析這其中的靈魂密碼。",
      align_title: "照片正位校正",
      align_desc: "請拖曳、旋轉照片，使鼻樑對準中線，雙眼對準水平線。",
      confirm_align: "確認對位",
      cancel_align: "取消"
    },
    map: {
      title: "面相圖解分析",
      mode_palace: "十二宮解析",
      mode_age: "流年運勢圖",
      hint: "* 點擊臉部 AR 標記查看詳細古籍解讀",
      guide: "請將眼睛對準水平線",
      select_prompt: "點擊上方臉部亮點，開啟 AR 解讀...",
      ar_tooltip: "點擊下方查看詳解",
      bg_character: "運"
    },
    diagrams: {
      title: "古籍圖解全析",
      subtitle: "探究《麻衣相法》原始圖譜的奧秘",
      fig1: {
        title: "圖一：流年運氣與十三部位",
        core_logic: "這是面相學的時間地圖。左圖「流年」解釋了一生運勢在臉上的流動路徑；右圖「十三部位」則是面部的中軸骨架。",
        points: [
          "童年運 (1-14歲)：看耳朵。輪廓分明代表童年健康好養。",
          "少年運 (15-30歲)：看額頭(火星)。天庭飽滿代表讀書運好，少年得志。",
          "青年運 (31-40歲)：看眉眼。眉清目秀代表貴人多，事業處於衝刺期。",
          "中年運 (41-50歲)：看鼻顴(土星)。鼻子挺拔有肉，代表中年財運大發，權力穩固。",
          "晚年運 (51歲後)：看人中與地閣(下巴)。下巴圓潤代表晚景優渥，兒孫滿堂。"
        ]
      },
      fig2: {
        title: "圖二：五嶽四瀆與十二宮",
        core_logic: "展示了「天人合一」的哲學。左圖將面部比喻為山河星辰；右圖則是實戰核心，將人生功能映射於面部。",
        points: [
          "五嶽 (山脈)：額為南嶽(主貴)，頦為北嶽(主富)，鼻為中嶽(主壽)，兩顴為東西嶽(主權)。五嶽朝歸，格局宏大。",
          "四瀆 (河流)：耳目口鼻四個孔竅如同江河。耳大孔深、鼻孔不露、口大容拳，象徵生命力與財源通暢。",
          "命宮 (印堂)：兩眉之間，願望總樞紐。宜寬亮(兩指寬)。",
          "財帛宮 (鼻)：鼻頭主正財，鼻翼主庫存。準頭豐隆，一生衣食無憂。",
          "官祿宮 (額中)：掌管事業與地位，飽滿無紋沖破者，位高權重。"
        ]
      }
    },
    howItWorks: {
      title: "AI 分析核心邏輯",
      subtitle: "從傳統面相到現代心理學的轉譯過程",
      steps: {
        step1: { title: "視覺特徵提取", desc: "AI 掃描臉部特徵、比例與氣色（如三庭五眼、皮膚光澤）。" },
        step2: { title: "古籍知識映射", desc: "將特徵對照《麻衣》、《柳莊》等古籍規則（如「鼻準有肉主財」）。" },
        step3: { title: "心理學轉譯", desc: "將宿命論轉化為性格優勢與心理學特質（如「執行力強」、「開放性高」）。" },
        step4: { title: "風格化輸出", desc: "生成適合社群分享、溫暖且具建設性的運勢報告。" }
      }
    },
    encyclopedia: {
      title: "相學百科",
      subtitle: "十二宮位詳解",
      palaces_title: "十二宮定義 (各宮位飽滿明亮為佳，凹陷有紋為忌)",
      palaces: {
        ming: "命宮（印堂）：兩眉之間。這是總樞紐，要寬敞明亮（兩指寬），代表一生願望容易實現。",
        cai: "財帛宮（鼻子）：鼻頭（準頭）代表正財，鼻翼（蘭台廷尉）代表偏財與庫存。",
        guan: "官祿宮（額頭中正）：額頭中央，掌管事業與官運。",
        tian: "田宅宮（眉眼間）：上眼皮位置。寬廣飽滿代表房產運好，家宅安寧。",
        nannv: "男女宮（眼下淚堂）：又稱子女宮。飽滿明潤代表生殖力強，子女優秀；凹陷或氣色黑代表為子女操勞。",
        qiqie: "妻妾宮（眼尾奸門）：太陽穴位置。飽滿代表夫妻和睦；凹陷或有紋痣代表感情多波折。",
        xiongdi: "兄弟宮（眉毛）：看兄弟姊妹助力及交友狀況。",
        jie: "疾厄宮（山根）：目と目の間の鼻の付け根。健康状態と先祖の基盤を見る。",
        qianyi: "遷移宮（額の角）：生え際の両側。移動、旅行、海外運を見る。",
        nupu: "奴僕宮（顎の両側）：地閣の一部。部下運や晩年の運勢を見る。",
        fude: "福徳宮（眉の上）：先祖の加護と個人の福徳を見る。",
        xiangmao: "相貌宮：顔全体の気色と精神状態を総括して見る。"
      }
    },
    analysis: {
      btn_start: "開始 AI 深度分析",
      btn_loading: "大師推算中...",
      title: "您的整合性面相報告",
      disclaimer: "* 本結果僅供參考，命運掌握在自己手中。",
      error_prefix: "分析受阻："
    },
    ai_prompt_lang: "繁體中文"
  },
  'en': {
    title: "AI Physiognomy Master",
    subtitle: "Ancient Wisdom, Modern Tech",
    desc_start: "Synthesizing the essence of",
    desc_highlight: "The Four Classics",
    desc_end: "to unveil\nthe secrets of your destiny.",
    desc_sub: "Discover your fortune through ancient Chinese wisdom.",
    tabs: {
      single: "Career & Life Path",
      couple: "Couple Compatibility",
      daily: "Daily Qi Scan",
      aging: "Time Machine",
      career2026: "2026 Career Radar",
      mirror: "Soul Mirror"
    },
    books: {
      mayi: { title: "Ma Yi", desc: "12 Palaces & Yearly Luck", details: "The definitive guide. Uses '12 Palaces' for destiny mapping and 'Yearly Luck' cycles for lifetime analysis." },
      liuzhuang: { title: "Liu Zhuang", desc: "5 Peaks & Qi", details: "Focuses on 'Five Peaks' structure for status and dynamic 'Qi' (energy color) for current luck." },
      shuijing: { title: "Water Mirror", desc: "Character Reading", details: "Practical classic for identifying loyalty and wisdom. Essential for social and career insights." },
      bingjian: { title: "Ice Mirror", desc: "Spirit & Bone", details: "Looks beyond the surface to the 'Spirit' and 'Bone Structure', revealing inner potential." }
    },
    upload: {
      title: "Upload Photo",
      ready: "Photo Ready",
      camera: "Camera",
      file: "Upload",
      hint: "Ensure good lighting and clear frontal view",
      error_type: "Please upload valid image (JPG/PNG).",
      error_read: "Failed to read file.",
      error_empty: "Please upload photo first."
    },
    couple: {
      p1_label: "Partner 1",
      p2_label: "Partner 2",
      upload_hint: "Upload clear frontal photos for both partners",
      analyze_btn: "Analyze Compatibility",
      match_score: "Harmony Score",
      result_title: "Compatibility Report"
    },
    daily: {
      title: "Daily Qi & Wellness Scan",
      subtitle: "Daily Energy Check",
      analyze_btn: "Scan My Qi",
      energy_level: "Today's Energy",
      health_tip: "🌿 Wellness Tip",
      fortune_tip: "🍀 Fortune Note"
    },
    aging: {
      title: "AI Fortune Time Machine",
      subtitle: "Appearance Born from Heart: See Your Future",
      path_virtue: "✨ Path of Virtue",
      path_worry: "🌪️ Path of Worry",
      btn_simulate: "Start Simulation",
      result_title: "Future Physiognomy Report",
      virtue_desc: "How your face transforms with inner peace...",
      worry_desc: "How stress shapes your future face..."
    },
    career2026: {
      title: "2026 Future Career Radar",
      subtitle: "Ancient Physiognomy × Global Trends",
      analyze_btn: "Predict My Future Career",
      trend_title: "2026 Global Trend Keywords",
      job_title: "Your Destiny Career",
      ancient_logic: "📜 Ancient Roots",
      future_logic: "🚀 Future Bloom"
    },
    mirror: {
      title: "AI Yin-Yang Soul Mirror",
      subtitle: "Reveal the secret asymmetry of your soul",
      analyze_btn: "Analyze Soul Contrast",
      inner_label: "Inner Face (Left/Innate)",
      outer_label: "Social Face (Right/Acquired)",
      upload_hint: "Upload a front face photo. AI will split and mirror it.",
      result_title: "Soul Discrepancy Report",
      concept_title: "Core Concept: Why Split the Face?",
      concept_desc: "Your left and right faces carry different meanings. We use AI mirroring to reveal your hidden 'Subconscious Self' vs 'Social Mask'.",
      left_face_title: "Left Face (Inner/Past)",
      left_face_desc: "Controlled by right brain. Rules emotions, intuition, and innate heritage. This is the 'Real You'.",
      right_face_title: "Right Face (Outer/Future)",
      right_face_desc: "Controlled by left brain. Rules logic, reason, and acquired social skills. This is the 'Social You'.",
      visual_shock_title: "Visual Impact & Psychology",
      visual_shock_desc: "Large asymmetry suggests inner conflict or high socialization. Symmetry suggests harmony. AI will decode this soul discrepancy for you.",
      align_title: "Photo Alignment",
      align_desc: "Drag, rotate and zoom to align the nose with the center line.",
      confirm_align: "Confirm Alignment",
      cancel_align: "Cancel"
    },
    map: {
      title: "Interactive Face Map",
      mode_palace: "12 Palaces",
      mode_age: "Yearly Luck",
      hint: "* Tap highlighted AR markers for details",
      guide: "Align eyes with line",
      select_prompt: "Tap a point on the face above to see the ancient interpretation here...",
      ar_tooltip: "Tap below for details",
      bg_character: "Luck"
    },
    diagrams: {
      title: "Classic Diagrams Decoded",
      subtitle: "Unlocking the secrets of the original 'Ma Yi' manuscripts",
      fig1: {
        title: "Fig 1: Yearly Luck & 13 Positions",
        core_logic: "This is the timeline of destiny. The left image shows how luck 'flows' across the face from age 1 to 100.",
        points: [
          "Childhood (1-14): Ears. Well-defined ears suggest a healthy upbringing.",
          "Youth (15-30): Forehead (Mars). A broad forehead indicates academic success and early achievement.",
          "Young Adult (31-40): Brows & Eyes. Clear eyes indicate social support and career acceleration.",
          "Middle Age (41-50): Nose & Cheeks (Saturn). A strong nose indicates peak wealth and power.",
          "Late Life (51+): Mouth & Chin. A round chin suggests a prosperous and peaceful retirement."
        ]
      },
      fig2: {
        title: "Fig 2: 5 Peaks & 12 Palaces",
        core_logic: "Shows the philosophy of 'Unity of Heaven and Man'. The face maps to mountains (stability) and rivers (vitality).",
        points: [
          "5 Peaks: Forehead, Chin, Nose, and Cheeks correlate to sacred mountains. Balance implies greatness.",
          "4 Rivers: Ears, Eyes, Mouth, Nose. Deep and clear 'rivers' symbolize the smooth flow of wealth.",
          "Life Palace (Yintang): Between brows. The hub of all desire and destiny.",
          "Wealth Palace (Nose): The tip is direct wealth; the wings are savings.",
          "Career Palace (Forehead): Governs status. Should be smooth without scars."
        ]
      }
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "From Ancient Texts to Modern Psychology",
      steps: {
        step1: { title: "Visual Scan", desc: "AI detects facial features, ratios (3 Sections, 5 Eyes), and skin tone." },
        step2: { title: "Ancient Mapping", desc: "Features are cross-referenced with rules from classics like 'Ma Yi' and 'Liu Zhuang'." },
        step3: { title: "Psych Translation", desc: "Converting fatalistic terms into personality traits and potential (e.g., 'Stubborn' -> 'Persistent')." },
        step4: { title: "Stylized Output", desc: "Generating a warm, constructive report formatted for social sharing." }
      }
    },
    encyclopedia: {
      title: "Physiognomy Encyclopedia",
      subtitle: "Deep dive into the 12 Palaces",
      palaces_title: "The 12 Life Palaces Definitions",
      palaces: {
        ming: "Life Palace (Yintang): Between brows. The hub of destiny. Should be wide (2 fingers) and bright for success.",
        cai: "Wealth Palace (Nose): Tip represents direct wealth; wings represent savings/storage.",
        guan: "Career Palace (Forehead Center): Governs career success and official status.",
        tian: "Property Palace (Upper Eyelid): Wide and full indicates good property luck and family harmony.",
        nannv: "Children Palace (Under Eyes): Full and bright indicates good fertility and capable children.",
        qiqie: "Marriage Palace (Temples): Fullness indicates a happy marriage; sunken areas or lines suggest conflict.",
        xiongdi: "Sibling Palace (Eyebrows): Indicates support from siblings and peers/friends.",
        jie: "Health Palace (Nose Bridge Root): Indicates health constitution and ancestral roots.",
        qianyi: "Travel Palace (Forehead Corners): Governs travel luck and success abroad.",
        nupu: "Subordinate Palace (Chin/Jaw): Indicates luck with subordinates and support in old age.",
        fude: "Fortune Palace (Above Brows): Ancestral blessings and personal luck/virtue.",
        xiangmao: "Overall Appearance: Assesses the overall spirit, qi (energy), and color of the face."
      }
    },
    analysis: {
      btn_start: "Reveal Destiny",
      btn_loading: "Analyzing...",
      title: "Physiognomy Report",
      disclaimer: "* Reference only. You hold your own destiny.",
      error_prefix: "Error:"
    },
    ai_prompt_lang: "English"
  },
  'ja': {
    title: "AI 人相占いマスター",
    subtitle: "古代の叡智と現代AIの融合",
    desc_start: "中国",
    desc_highlight: "四大観相学",
    desc_end: "の精髄を集結し、\n運命の秘密を解き明かします。",
    desc_sub: "五官と気色を分析し、あなたの運勢を占います。",
    tabs: {
      single: "キャリアと人生",
      couple: "カップル相性診断",
      daily: "毎日の気色スキャン",
      aging: "AI タイムマシン",
      career2026: "2026 未来キャリア",
      mirror: "陰陽ミラー"
    },
    books: {
      mayi: { title: "麻衣相法", desc: "十二宮と流年", details: "人相学の基本。「十二宮」で運命の領域を定め、「流年法」で一生の運勢を分析します。" },
      liuzhuang: { title: "柳荘相法", desc: "五嶽と気色", details: "「五嶽四瀆」で器の大きさを、「気色」の変化で現在の吉凶を判断します。" },
      shuijing: { title: "水鏡相法", desc: "人物鑑定", details: "実用的な古典。忠義や賢愚を見分け、職場や社交の場での人付き合いに役立ちます。" },
      bingjian: { title: "氷鑑", desc: "精神と骨格", details: "「神（精神）」と「骨（骨格）」を観て、内面的な器と将来の可能性を洞察します。" }
    },
    upload: {
      title: "写真アップロード",
      ready: "準備完了",
      camera: "カメラ",
      file: "アルバム",
      hint: "明るい場所で正面から撮影してください",
      error_type: "有効な画像(JPG/PNG)をアップロードしてください。",
      error_read: "読み込み失敗。",
      error_empty: "先に写真をアップロードしてください。"
    },
    couple: {
      p1_label: "パートナー1",
      p2_label: "パートナー2",
      upload_hint: "二人の正面写真をアップロードしてください",
      analyze_btn: "相性を診断する",
      match_score: "相性度",
      result_title: "相性診断レポート"
    },
    daily: {
      title: "毎日の気色健康スキャン",
      subtitle: "Daily Energy Check",
      analyze_btn: "気色をスキャン",
      energy_level: "今日のエネルギー",
      health_tip: "🌿 健康アドバイス",
      fortune_tip: "🍀 今日の運勢メモ"
    },
    aging: {
      title: "AI 運勢タイムマシン",
      subtitle: "相は心より生ず：10年後の自分を見る",
      path_virtue: "✨ 徳を積む道",
      path_worry: "🌪️ 苦労の道",
      btn_simulate: "シミュレーション開始",
      result_title: "未来の人相予測",
      virtue_desc: "心が穏やかであれば、人相はどう変わるか...",
      worry_desc: "苦労や心配が続くと、人相はどうなるか..."
    },
    career2026: {
      title: "2026 未来キャリアレーダー",
      subtitle: "古法面相 × 世界トレンド",
      analyze_btn: "未来の天職を予測",
      trend_title: "2026 世界トレンドキーワード",
      job_title: "あなたの天命職業",
      ancient_logic: "📜 古代の根拠",
      future_logic: "🚀 未来の開花"
    },
    mirror: {
      title: "AI 陰陽顕影鏡",
      subtitle: "左右非対称の顔から魂の秘密を暴く",
      analyze_btn: "魂のギャップを分析",
      inner_label: "内なる顔 (左顔/先天)",
      outer_label: "社会的な顔 (右顔/後天)",
      upload_hint: "正面写真をアップロードしてください。AIが自動で分割します。",
      result_title: "魂のギャップ診断書",
      concept_title: "核心概念：なぜ左右の顔を見るのか？",
      concept_desc: "人の左顔と右顔は全く異なる意味を持ちます。AIミラーリング技術で、あなたの「潜在意識」と「社会的仮面」のギャップを可視化します。",
      left_face_title: "左顔 (内面/過去)",
      left_face_desc: "右脳が制御。感情、直感、先祖からの遺伝を表す。「本当のあなた」。",
      right_face_title: "右顔 (外面/未来)",
      right_face_desc: "左脳が制御。理性、論理、後天的な努力を表す。「社会的なあなた」。",
      visual_shock_title: "視覚的衝撃と心理分析",
      visual_shock_desc: "二つの顔の差が大きいほど、内面と外面の葛藤が大きいことを示します。AIがその魂の秘密を解読します。",
      align_title: "写真の調整",
      align_desc: "ドラッグ、回転、ズームで、鼻筋を中心線に合わせてください。",
      confirm_align: "調整を確定",
      cancel_align: "キャンセル"
    },
    map: {
      title: "人相図解分析",
      mode_palace: "十二宮解析",
      mode_age: "流年運勢図",
      hint: "* 光る点をタップして詳細を見る",
      guide: "目を水平線に合わせてください",
      select_prompt: "上の顔の光る点をタップすると、ここに詳細が表示されます...",
      ar_tooltip: "下をタップして詳細",
      bg_character: "運"
    },
    diagrams: {
      title: "古籍図解全析",
      subtitle: "「麻衣相法」原本の秘密を探る",
      fig1: {
        title: "図一：流年運気と十三部位",
        core_logic: "これは人相学のタイムラインです。左図は一生の運勢が顔の上をどのように流れるかを示しています。",
        points: [
          "幼年運 (1-14歳)：耳を見る。輪郭がはっきりしていれば健康で育てやすい。",
          "少年運 (15-30歳)：額を見る(火星)。額が広ければ学業に優れ、若くして志を得る。",
          "青年運 (31-40歳)：眉と目を見る。目が澄んでいれば、良き友に恵まれ事業が加速する。",
          "中年運 (41-50歳)：鼻と頬を見る(土星)。鼻が高く肉付きが良いのは、財運と権力の絶頂。",
          "晩年運 (51歳以降)：口と顎を見る(地閣)。顎が丸ければ、晩年は豊かで安泰。"
        ]
      },
      fig2: {
        title: "図二：五嶽四瀆と十二宮",
        core_logic: "「天人合一」の哲学を示しています。顔を山河に見立て、人生の機能をマッピングしています。",
        points: [
          "五嶽 (山脈)：額(南嶽)、顎(北嶽)、鼻(中嶽)、頬(東西嶽)。バランスが良ければ大成する。",
          "四瀆 (河川)：耳目口鼻。深く清らかな流れは、財運が滞りなく流れることを象徴する。",
          "命宮 (印堂)：眉間。願望の成就を見る中心点。",
          "財帛宮 (鼻)：鼻先は正財、小鼻は貯蓄を表す。",
          "官禄宮 (額)：事業と地位を司る。傷がなく広いのが良い。"
        ]
      }
    },
    howItWorks: {
      title: "AI 分析の仕組み",
      subtitle: "伝統的な人相学から現代心理学への翻訳プロセス",
      steps: {
        step1: { title: "視覚的特徴の抽出", desc: "AIが顔の特徴、比率（三庭五眼）、肌の色つやをスキャンします。" },
        step2: { title: "古籍との照合", desc: "特徴を『麻衣相法』や『柳荘相法』などの古典的なルールと照らし合わせます。" },
        step3: { title: "心理学的翻訳", desc: "運命論的な用語を、性格の強みや潜在能力（例：「頑固」→「粘り強い」）に変換します。" },
        step4: { title: "スタイリッシュな出力", desc: "SNSでのシェアに適した、温かく建設的なレポートを生成します。" }
      }
    },
    encyclopedia: {
      title: "人相学百科",
      subtitle: "十二宮の詳細解説",
      palaces_title: "十二宮の定義 (豊かで明るいのが吉、凹みや傷は凶)",
      palaces: {
        ming: "命宮（印堂）：眉間。運勢の要。指2本分の幅があり、明るく輝いていると願望が叶いやすい。",
        cai: "財帛宮（鼻）：鼻先（準頭）は正財、小鼻（蘭台廷尉）は貯蓄を表す。",
        guan: "官禄宮（額の中央）：事業と社会的地位を司る。",
        tian: "田宅宮（眉と目の間）：上瞼。広く豊かであれば不動産運が良く、家庭円満。",
        nannv: "男女宮（涙堂）：子女宮とも呼ぶ。ふっくらと潤いがあれば子宝に恵まれる。",
        qiqie: "妻妾宮（目尻）：奸門とも呼ぶ。豊満であれば夫婦仲が良い。",
        xiongdi: "兄弟宮（眉）：兄弟姉妹や友人からの助けを見る。",
        jie: "疾厄宮（山根）：目と目の間の鼻の付け根。健康状態と先祖の基盤を見る。",
        qianyi: "遷移宮（額の角）：生え際の両側。移動、旅行、海外運を見る。",
        nupu: "奴僕宮（顎の両側）：地閣の一部。部下運や晩年の運勢を見る。",
        fude: "福徳宮（眉の上）：先祖の加護と個人の福徳を見る。",
        xiangmao: "相貌宮：顔全体の気色と精神状態を総括して見る。"
      }
    },
    analysis: {
      btn_start: "運命を鑑定",
      btn_loading: "鑑定中...",
      title: "鑑定報告書",
      disclaimer: "* 結果は参考です。運命は自分で切り開くものです。",
      error_prefix: "エラー："
    },
    ai_prompt_lang: "Japanese (日本語)"
  }
};

// ... (getFacePoints, helper components BookBadge, EncyclopediaCard, HowItWorksSection, ClassicDiagramSection, EncyclopediaSection, MirrorModeExplanation, ImageAligner are unchanged)
// Re-adding for context and completeness

const getFacePoints = (lang: Language, mode: MapMode): FacePoint[] => {
  const isZh = lang === 'zh-TW';
  const isJa = lang === 'ja';
  const t_palaces = TRANSLATIONS[lang].encyclopedia.palaces;
  
  if (mode === 'palaces') {
    return [
      // Midline (Central Axis)
      { id: 'guan', name: isZh ? '官祿宮' : isJa ? '官禄宮' : 'Career', shortDesc: isZh ? '事業地位' : isJa ? '仕事運' : 'Career', x: 50, y: 22, desc: t_palaces.guan, book: isZh ? '水鏡' : isJa ? '水鏡' : 'Water Mirror' },
      { id: 'ming', name: isZh ? '命宮(印堂)' : isJa ? '命宮(印堂)' : 'Life', shortDesc: isZh ? '願望樞紐' : isJa ? '願望成就' : 'Destiny Core', x: 50, y: 39, desc: t_palaces.ming, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'ji', name: isZh ? '疾厄宮' : isJa ? '疾厄宮' : 'Health', shortDesc: isZh ? '健康根基' : isJa ? '健康運' : 'Vitality', x: 50, y: 47, desc: t_palaces.jie, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'cai', name: isZh ? '財帛宮' : isJa ? '財帛宮' : 'Wealth', shortDesc: isZh ? '正財庫存' : isJa ? '金運' : 'Wealth', x: 50, y: 62, desc: t_palaces.cai, book: isZh ? '柳莊' : isJa ? '柳莊' : 'Liu Zhuang' },
      // Upper Face
      { id: 'qian_l', name: isZh ? '遷移宮' : isJa ? '遷移宮' : 'Travel', shortDesc: isZh ? '外出變動' : isJa ? '旅行運' : 'Movement', x: 18, y: 20, desc: t_palaces.qianyi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'qian_r', name: isZh ? '遷移宮' : isJa ? '遷移宮' : 'Travel', shortDesc: isZh ? '外出變動' : isJa ? '旅行運' : 'Movement', x: 82, y: 20, desc: t_palaces.qianyi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'fu_l', name: isZh ? '福德宮' : isJa ? '福徳宮' : 'Fortune', shortDesc: isZh ? '福報祖蔭' : isJa ? '福徳' : 'Blessings', x: 22, y: 28, desc: t_palaces.fude, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      { id: 'fu_r', name: isZh ? '福德宮' : isJa ? '福徳宮' : 'Fortune', shortDesc: isZh ? '福報祖蔭' : isJa ? '福徳' : 'Blessings', x: 78, y: 28, desc: t_palaces.fude, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      // Brows
      { id: 'bro_l', name: isZh ? '兄弟宮' : isJa ? '兄弟宮' : 'Brothers', shortDesc: isZh ? '交友助力' : isJa ? '兄弟運' : 'Siblings', x: 22, y: 34, desc: t_palaces.xiongdi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'bro_r', name: isZh ? '兄弟宮' : isJa ? '兄弟宮' : 'Brothers', shortDesc: isZh ? '交友助力' : isJa ? '兄弟運' : 'Siblings', x: 78, y: 34, desc: t_palaces.xiongdi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      // Mid Face
      { id: 'tian_l', name: isZh ? '田宅宮' : isJa ? '田宅宮' : 'Property', shortDesc: isZh ? '房產家運' : isJa ? '不動産運' : 'Assets', x: 35, y: 42, desc: t_palaces.tian, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'tian_r', name: isZh ? '田宅宮' : isJa ? '田宅宮' : 'Property', shortDesc: isZh ? '房產家運' : isJa ? '不動産運' : 'Assets', x: 65, y: 42, desc: t_palaces.tian, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'qi_l', name: isZh ? '妻妾宮' : isJa ? '夫妻宮' : 'Marriage', shortDesc: isZh ? '婚姻感情' : isJa ? '恋愛運' : 'Romance', x: 10, y: 44, desc: t_palaces.qiqie, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      { id: 'qi_r', name: isZh ? '妻妾宮' : isJa ? '夫妻宮' : 'Marriage', shortDesc: isZh ? '婚姻感情' : isJa ? '恋愛運' : 'Romance', x: 90, y: 44, desc: t_palaces.qiqie, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      { id: 'zi_l', name: isZh ? '男女宮' : isJa ? '子女宮' : 'Children', shortDesc: isZh ? '子女緣分' : isJa ? '子供運' : 'Offspring', x: 35, y: 52, desc: t_palaces.nannv, book: isZh ? '水鏡' : isJa ? '水鏡' : 'Water Mirror' },
      { id: 'zi_r', name: isZh ? '男女宮' : isJa ? '子女宮' : 'Children', shortDesc: isZh ? '子女緣分' : isJa ? '子供運' : 'Offspring', x: 65, y: 52, desc: t_palaces.nannv, book: isZh ? '水鏡' : isJa ? '水鏡' : 'Water Mirror' },
      // Lower Face
      { id: 'nu', name: isZh ? '奴僕宮' : isJa ? '奴僕宮' : 'Subordinate', shortDesc: isZh ? '晚輩部屬' : isJa ? '部下運' : 'Leadership', x: 50, y: 90, desc: t_palaces.nupu, book: isZh ? '柳莊' : isJa ? '柳莊' : 'Liu Zhuang' },
    ];
  } else {
    return [
      { id: 'ear_l', name: isZh ? '童年運(金星)' : isJa ? '幼年運' : 'Childhood', shortDesc: isZh ? '1-14歲' : isJa ? '1-14歳' : 'Age 1-14', x: 8, y: 50, ageRange: '1-14', desc: isZh ? '看左耳。輪廓分明，童年健康好養。' : isJa ? '左耳。輪郭がはっきりしていれば健康。' : 'Left Ear. Childhood health.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'ear_r', name: isZh ? '童年運(木星)' : isJa ? '幼年運' : 'Childhood', shortDesc: isZh ? '1-14歲' : isJa ? '1-14歳' : 'Age 1-14', x: 92, y: 50, ageRange: '1-14', desc: isZh ? '看右耳。耳大有福，聰明伶俐。' : isJa ? '右耳。耳が大きければ福がある。' : 'Right Ear. Intelligence.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'fore', name: isZh ? '少年運(火星)' : isJa ? '少年運' : 'Youth', shortDesc: isZh ? '15-30歲' : isJa ? '15-30歳' : 'Age 15-30', x: 50, y: 22, ageRange: '15-30', desc: isZh ? '看額頭。天庭飽滿，少年得志，學業順遂。' : isJa ? '額。額が広ければ学業に優れる。' : 'Forehead. Academic success in youth.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'brow', name: isZh ? '青年運(羅計)' : isJa ? '青年運' : 'Young Adult', shortDesc: isZh ? '31-34歲' : isJa ? '31-34歳' : 'Age 31-34', x: 50, y: 35, ageRange: '31-34', desc: isZh ? '看眉毛。眉清目秀，貴人多助。' : isJa ? '眉。眉が美しければ助けが多い。' : 'Brows. Social help.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'eye', name: isZh ? '青年運(日月)' : isJa ? '青年運' : 'Young Adult', shortDesc: isZh ? '35-40歲' : isJa ? '35-40歳' : 'Age 35-40', x: 50, y: 44, ageRange: '35-40', desc: isZh ? '看眼睛。眼神含藏，事業衝刺期。' : isJa ? '目。目が澄んでいれば事業が伸びる。' : 'Eyes. Career peak.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'nose', name: isZh ? '中年運(土星)' : isJa ? '中年運' : 'Middle Age', shortDesc: isZh ? '41-50歲' : isJa ? '41-50歳' : 'Age 41-50', x: 50, y: 58, ageRange: '41-50', desc: isZh ? '看鼻準與兩顴。鼻挺顴豐，財富權力高峰。' : isJa ? '鼻と頬。鼻が高ければ財運の絶頂。' : 'Nose/Cheeks. Wealth peak.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'mouth', name: isZh ? '晚年運(水星)' : isJa ? '晩年運' : 'Late Life', shortDesc: isZh ? '51-60歲' : isJa ? '51-60歳' : 'Age 51-60', x: 50, y: 78, ageRange: '51-60', desc: isZh ? '看人中與嘴唇。稜角分明，食祿豐厚。' : isJa ? '口。形が良ければ食に困らない。' : 'Mouth. Luck in 50s.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'chin', name: isZh ? '晚年運(地閣)' : isJa ? '晩年運' : 'Late Life', shortDesc: isZh ? '61歲後' : isJa ? '61歳以降' : 'Age 61+', x: 50, y: 92, ageRange: '61+', desc: isZh ? '看下巴。圓厚有力，晚景優渥，兒孫滿堂。' : isJa ? '顎。丸ければ晩年は安泰。' : 'Chin. Retirement luck.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
    ];
  }
};

const BookBadge: React.FC<{ title: string; titleEn: string; desc: string; icon: string; details: string }> = ({ title, titleEn, desc, icon, details }) => (
  <div className="bg-indigo-900/40 backdrop-blur-md border border-indigo-400/30 rounded-xl p-4 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-center min-h-[160px] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="text-3xl mb-2 opacity-80 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-yellow-300 font-bold text-lg tracking-wider">{title}</div>
      <div className="text-yellow-100/60 text-[10px] font-serif italic mb-2 uppercase">{titleEn}</div>
      <div className="text-indigo-200 text-xs font-light tracking-wide border-t border-indigo-500/30 pt-2">{desc}</div>
      <div className="hidden group-hover:block absolute inset-0 bg-indigo-950/95 p-4 flex items-center justify-center text-xs text-yellow-50 leading-relaxed text-justify">
        {details}
      </div>
    </div>
  </div>
);

const EncyclopediaCard: React.FC<{ title: string; desc: string; icon: string }> = ({ title, desc, icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
    <div className="flex items-center mb-2">
      <span className="text-2xl mr-3">{icon}</span>
      <h4 className="text-yellow-300 font-bold text-sm sm:text-base">{title}</h4>
    </div>
    <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed opacity-90">{desc}</p>
  </div>
);

const HowItWorksSection: React.FC<{ t: Translation }> = ({ t }) => {
  const steps = [
    { icon: "👁️", data: t.howItWorks.steps.step1 },
    { icon: "📜", data: t.howItWorks.steps.step2 },
    { icon: "🧠", data: t.howItWorks.steps.step3 },
    { icon: "💌", data: t.howItWorks.steps.step4 },
  ];

  return (
    <div className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.howItWorks.title}</h2>
        <p className="text-indigo-300">{t.howItWorks.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 relative group hover:bg-indigo-800/30 transition-all">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-indigo-900 text-lg shadow-lg">
              {idx + 1}
            </div>
            <div className="text-4xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
            <h3 className="text-lg font-bold text-yellow-300 text-center mb-3">{step.data.title}</h3>
            <p className="text-sm text-indigo-200 text-center leading-relaxed opacity-90">{step.data.desc}</p>
            {idx < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-indigo-500/30 z-0"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const ClassicDiagramSection: React.FC<{ t: Translation }> = ({ t }) => {
  const diagrams = [
    { 
      src: "https://i.meee.com.tw/GLhngD9.png",
      data: t.diagrams.fig1 
    },
    { 
      src: "https://i.meee.com.tw/xBBFEB4.png",
      data: t.diagrams.fig2 
    }
  ];

  return (
    <div className="border-t border-white/10 pt-16 mb-16" id="classic-diagrams">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.diagrams.title}</h2>
        <p className="text-indigo-300">{t.diagrams.subtitle}</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {diagrams.map((d, idx) => (
          <div key={idx} className="bg-indigo-900/20 rounded-3xl p-6 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
            <div className="relative rounded-xl overflow-hidden mb-6 group cursor-zoom-in aspect-[4/3] bg-black/40">
              <img 
                src={d.src} 
                alt={d.data.title} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = "https://placehold.co/800x600/1e1b4b/fbbf24?text=Image+Not+Found"; 
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur text-xs text-center text-yellow-300">{d.data.title}</div>
            </div>
            <div className="space-y-4">
               <div className="bg-indigo-950/50 p-4 rounded-lg">
                 <h4 className="text-yellow-400 font-bold mb-2 text-sm uppercase tracking-wider">Core Logic</h4>
                 <p className="text-indigo-100 text-sm leading-relaxed">{d.data.core_logic}</p>
               </div>
               <div>
                 <h4 className="text-indigo-300 font-bold mb-3 text-xs uppercase tracking-wider">Key Interpretations</h4>
                 <ul className="space-y-3">
                   {d.data.points.map((pt, i) => (
                     <li key={i} className="flex items-start text-sm text-indigo-50/90 leading-relaxed">
                       <span className="mr-2 mt-1 w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>{pt}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EncyclopediaSection: React.FC<{ t: Translation }> = ({ t }) => {
  const palaces = Object.entries(t.encyclopedia.palaces);
  return (
    <div className="border-t border-white/10 pt-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.encyclopedia.title}</h2>
        <p className="text-indigo-300 mb-8">{t.encyclopedia.subtitle}</p>
        <div className="inline-block bg-indigo-900/30 rounded-full px-6 py-2 border border-indigo-500/30 text-yellow-300 text-sm font-semibold">{t.encyclopedia.palaces_title}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {palaces.map(([key, desc], idx) => (
          <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all hover:-translate-y-1">
            <div className="flex items-start">
              <span className="text-yellow-500/50 text-4xl font-serif mr-3 -mt-1">{idx + 1}</span>
              <p className="text-indigo-100 text-sm leading-relaxed text-justify">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MirrorModeExplanation: React.FC<{ t: Translation }> = ({ t }) => {
  return (
    <div className="mt-10 mb-16 animate-fadeIn">
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 md:p-10">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 mb-4 bg-indigo-600/30 rounded-full border border-indigo-400/30 text-indigo-200 text-xs tracking-widest uppercase">DEEP DIVE</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.mirror.concept_title}</h2>
          <p className="text-indigo-200 max-w-3xl mx-auto leading-relaxed">{t.mirror.concept_desc}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-indigo-900/30 rounded-2xl p-6 border border-indigo-500/20 hover:bg-indigo-900/50 transition-colors flex flex-col items-center text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">{t.mirror.left_face_title}</h3>
            <div className="w-12 h-1 bg-yellow-500/50 rounded-full mb-4"></div>
            <p className="text-sm text-indigo-100 leading-relaxed">{t.mirror.left_face_desc}</p>
          </div>
          <div className="bg-purple-900/30 rounded-2xl p-6 border border-purple-500/20 hover:bg-purple-900/50 transition-colors flex flex-col items-center text-center">
            <div className="text-5xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-purple-300 mb-2">{t.mirror.right_face_title}</h3>
            <div className="w-12 h-1 bg-purple-500/50 rounded-full mb-4"></div>
            <p className="text-sm text-indigo-100 leading-relaxed">{t.mirror.right_face_desc}</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
           <div className="flex-shrink-0 bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30">⚡</div>
           <div className="text-center md:text-left">
             <h3 className="text-lg font-bold text-white mb-2">{t.mirror.visual_shock_title}</h3>
             <p className="text-indigo-200 text-sm leading-relaxed">{t.mirror.visual_shock_desc}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ImageAligner: React.FC<{
  imageData: string;
  onConfirm: (alignedData: string) => void;
  onCancel: () => void;
  t: Translation;
}> = ({ imageData, onConfirm, onCancel, t }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rotate: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = new Image();
    img.onload = () => {
        if (!canvas || !ctx) return;
        const size = 600; 
        canvas.width = size;
        canvas.height = size;
        
        ctx.clearRect(0, 0, size, size);
        ctx.save();
        
        ctx.translate(size / 2, size / 2);
        
        ctx.rotate((transform.rotate * Math.PI) / 180);
        ctx.scale(transform.scale, transform.scale);
        ctx.translate(transform.x, transform.y); 
        
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        ctx.restore();
        
        const aligned = canvas.toDataURL('image/jpeg').split(',')[1];
        onConfirm(aligned);
    };
    img.src = `data:image/jpeg;base64,${imageData}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-indigo-950 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-indigo-500/30">
        <div className="text-center mb-4 relative">
           <button onClick={onCancel} className="absolute left-0 top-0 text-indigo-400 hover:text-white text-2xl">×</button>
          <h3 className="text-xl font-bold text-white">{t.mirror.align_title}</h3>
          <p className="text-xs text-indigo-300">{t.mirror.align_desc}</p>
        </div>

        <div 
          ref={containerRef}
          className="relative w-full aspect-square bg-black rounded-xl overflow-hidden cursor-move touch-none border-2 border-indigo-500/50"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
             <img 
               src={`data:image/jpeg;base64,${imageData}`} 
               alt="Align" 
               style={{
                 transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg) scale(${transform.scale})`,
                 maxWidth: 'none', 
                 maxHeight: '80vh' 
               }}
             />
          </div>

          <div className="absolute inset-0 pointer-events-none z-10">
             <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-yellow-400/70 -translate-x-1/2 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
             <div className="absolute top-[42%] left-0 right-0 h-0.5 bg-yellow-400/50 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
             <div className="absolute top-[10%] bottom-[10%] left-[20%] right-[20%] border-2 border-dashed border-white/30 rounded-[50%]"></div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
             <span className="text-xs w-12 text-indigo-300">Rotate</span>
             <input type="range" min="-45" max="45" value={transform.rotate} onChange={e => setTransform({...transform, rotate: Number(e.target.value)})} className="flex-1 accent-yellow-400" />
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs w-12 text-indigo-300">Zoom</span>
             <input type="range" min="0.5" max="3" step="0.1" value={transform.scale} onChange={e => setTransform({...transform, scale: Number(e.target.value)})} className="flex-1 accent-yellow-400" />
          </div>
          <div className="flex gap-3">
             <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all">{t.mirror.cancel_align}</button>
             <button onClick={confirm} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg transition-all">{t.mirror.confirm_align}</button>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

// --- 5. Main Application Component ---

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('single');
  const [imageData, setImageData] = useState<string | null>(null);
  const [coupleData, setCoupleData] = useState<{ p1: string | null; p2: string | null }>({ p1: null, p2: null });
  const [agingPath, setAgingPath] = useState<'virtue' | 'worry' | null>(null);
  const [mirrorImages, setMirrorImages] = useState<{ inner: string; outer: string } | null>(null);
  const [isAligning, setIsAligning] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<Language>('zh-TW');
  
  // UX States
  const [showFaceMap, setShowFaceMap] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<MapMode>('palaces');
  const [selectedPoint, setSelectedPoint] = useState<FacePoint | null>(null);

  const t = TRANSLATIONS[language];
  const facePoints = getFacePoints(language, mapMode);
  const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // --- Handlers ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]); 
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processMirrorImages = async (base64Data: string): Promise<{ inner: string, outer: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject("Canvas error"); return; }
            const w = img.width;
            const h = img.height;
            const halfW = Math.floor(w / 2);
            canvas.width = w; 
            canvas.height = h;
            // Inner Face
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, halfW, 0, halfW, h, halfW, 0, halfW, h);
            ctx.save(); ctx.scale(-1, 1); ctx.drawImage(img, halfW, 0, halfW, h, -halfW, 0, halfW, h); ctx.restore();
            const innerBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            // Outer Face
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, halfW, h, 0, 0, halfW, h);
            ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, halfW, h, 0, 0, halfW, h); ctx.restore();
            const outerBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            resolve({ inner: innerBase64, outer: outerBase64 });
        };
        img.onerror = reject;
        img.src = `data:image/jpeg;base64,${base64Data}`;
    });
  };

  const handleSingleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { event.target.value = ''; handleSingleFileProcess(file); }
  };

  const handleSingleFileProcess = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) { setError("僅支援 JPG, PNG, WEBP 格式圖片"); return; }
    try {
      const base64Data = await fileToBase64(file);
      if (appMode === 'mirror') { setImageData(base64Data); setIsAligning(true); setMirrorImages(null); } 
      else { setImageData(base64Data); setError(''); setAnalysisResult(''); setShowFaceMap(true); setSelectedPoint(null); setAgingPath(null); }
    } catch { setError(t.upload.error_read); }
  };

  const handleAlignmentConfirm = async (alignedBase64: string) => {
      setIsAligning(false); setImageData(alignedBase64); 
      try { const mirrors = await processMirrorImages(alignedBase64); setMirrorImages(mirrors); setError(''); setAnalysisResult(''); } 
      catch (e) { setError("Error generating mirror images."); }
  };
  
  const handleAlignmentCancel = () => { setIsAligning(false); setImageData(null); };

  const handleCoupleFileChange = async (event: ChangeEvent<HTMLInputElement>, partner: 'p1' | 'p2') => {
    const file = event.target.files?.[0];
    if (file && file.type.match(/^image\/(jpeg|png|webp)$/)) {
        try { const base64Data = await fileToBase64(file); setCoupleData(prev => ({ ...prev, [partner]: base64Data })); setError(''); setAnalysisResult(''); } 
        catch { setError(t.upload.error_read); }
    } else { if(file) setError("僅支援 JPG, PNG, WEBP 格式圖片"); }
    event.target.value = '';
  };

  const handleAgingSimulation = async (path: 'virtue' | 'worry') => {
    setAgingPath(path); setIsLoading(true); setError(''); setAnalysisResult('');
    if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
    const systemPrompt = `你是一位精通《麻衣相法》與《柳莊相法》的時光運勢大師...`; 
    const userQuery = `Simulate aging for path: ${path}. Language: ${t.ai_prompt_lang}. No Markdown.`;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: imageData } }] }], systemInstruction: { parts: [{ text: systemPrompt }] } }),
        });
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) setAnalysisResult(text.replace(/[*#]/g, '')); else throw new Error("No result");
    } catch (e) { setError(t.analysis.error_prefix + " Connection failed."); } finally { setIsLoading(false); }
  };

  const analyze = async () => {
    setIsLoading(true); setError('');
    setTimeout(() => document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    let systemPrompt = ""; let userQuery = ""; let parts: any[] = [];
    if (appMode === 'single') {
        if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
        systemPrompt = `你同時身兼兩位頂尖導師的角色...`; 
        userQuery = `Analyze this face in Social Media Post Style. Language: ${t.ai_prompt_lang}. Include Emojis. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: imageData } }];
    } else if (appMode === 'couple') {
        if (!coupleData.p1 || !coupleData.p2) { setError("請先上傳兩張照片"); setIsLoading(false); return; }
        systemPrompt = `你同時身兼 **AI面相數據標註師** 與 **整合性情感顧問**...`;
        userQuery = `Analyze compatibility. Language: ${t.ai_prompt_lang}. Include Emojis. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: coupleData.p1 } }, { inlineData: { mimeType: "image/jpeg", data: coupleData.p2 } }];
    } else if (appMode === 'daily') {
        if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
        systemPrompt = `你是一位精通《柳莊相法》氣色理論的 **AI 氣色健康顧問**...`;
        userQuery = `Analyze daily facial qi/color. Language: ${t.ai_prompt_lang}. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: imageData } }];
    } else if (appMode === 'career2026') {
        if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
        systemPrompt = `你是一位 **賽博玄學職涯顧問 (Cyber-Metaphysicist)**...`;
        userQuery = `Predict 2026 career. Language: ${t.ai_prompt_lang}. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: imageData } }];
    } else if (appMode === 'mirror') {
        if (!mirrorImages) { setError("Processing mirror images..."); setIsLoading(false); return; }
        systemPrompt = `你是一位精通心理學與面相學的 **靈魂分析師**...`;
        userQuery = `Analyze contrast. Language: ${t.ai_prompt_lang}. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: mirrorImages.inner } }, { inlineData: { mimeType: "image/jpeg", data: mirrorImages.outer } }];
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: parts }], systemInstruction: { parts: [{ text: systemPrompt }] } }),
      });
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAnalysisResult(text.replace(/[*#]/g, '')); else throw new Error("No result");
    } catch (e) { setError(t.analysis.error_prefix + " Connection failed."); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-indigo-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex justify-end mb-6">
           <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex space-x-1 border border-white/10">
              {(['zh-TW', 'en', 'ja'] as Language[]).map(l => (
                  <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-1 rounded-full text-xs transition-all ${language === l ? 'bg-yellow-400 text-indigo-950 font-bold' : 'text-indigo-300 hover:text-white'}`}>{l === 'zh-TW' ? '中' : l === 'en' ? 'EN' : '日'}</button>
              ))}
           </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 mb-4 border border-yellow-500/30 rounded-full bg-yellow-500/10 text-yellow-300 text-xs tracking-widest uppercase">{t.subtitle}</div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100 mb-6 drop-shadow-sm">{t.title}</h1>
          <div className="flex justify-center mb-8">
             {/* Improved Tab Navigation for better UI/UX */}
             <div className="bg-indigo-950/50 p-1 rounded-xl sm:rounded-full border border-indigo-500/30 flex flex-wrap justify-center gap-1 sm:gap-0 relative overflow-hidden w-full sm:w-auto">
                
                {/* Desktop Slider (Visible only on SM+) */}
                <div className={`hidden sm:block absolute top-1 bottom-1 w-[calc(16.666%-2px)] bg-indigo-600 rounded-full transition-all duration-300 ease-out
                    ${appMode === 'single' ? 'left-1' : 
                      appMode === 'couple' ? 'left-[calc(16.666%+1px)]' : 
                      appMode === 'daily' ? 'left-[calc(33.333%+1px)]' : 
                      appMode === 'aging' ? 'left-[calc(50%+1px)]' : 
                      appMode === 'career2026' ? 'left-[calc(66.666%+1px)]' : 
                      'left-[calc(83.333%+0px)]'}`}></div>

                {/* Tab Buttons */}
                {(['single', 'couple', 'daily', 'aging', 'career2026', 'mirror'] as AppMode[]).map(mode => (
                    <button key={mode} onClick={() => { setAppMode(mode); setAnalysisResult(''); setError(''); }} 
                        className={`relative z-10 px-2 py-3 sm:py-2 rounded-lg sm:rounded-full text-xs font-bold transition-all w-[32%] sm:w-24 text-center flex items-center justify-center
                        ${appMode === mode 
                            ? 'bg-indigo-600 text-white shadow-lg sm:bg-transparent' // Mobile active bg, Desktop transparent
                            : 'text-indigo-300 hover:text-white hover:bg-white/5'}`}>
                       {t.tabs[mode]}
                    </button>
                ))}
             </div>
          </div>
        </div>

        {isAligning && imageData && <ImageAligner imageData={imageData} onConfirm={handleAlignmentConfirm} onCancel={handleAlignmentCancel} t={t} />}

        {appMode === 'single' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <BookBadge title={t.books.mayi.title} titleEn="Ma Yi" desc={t.books.mayi.desc} icon="📜" details={t.books.mayi.details} />
                <BookBadge title={t.books.liuzhuang.title} titleEn="Liu Zhuang" desc={t.books.liuzhuang.desc} icon="👀" details={t.books.liuzhuang.details} />
                <BookBadge title={t.books.shuijing.title} titleEn="Water Mirror" desc={t.books.shuijing.desc} icon="⚖️" details={t.books.shuijing.details} />
                <BookBadge title={t.books.bingjian.title} titleEn="Ice Mirror" desc={t.books.bingjian.desc} icon="🧊" details={t.books.bingjian.details} />
            </div>
        )}

        {/* Main Content */}
        <div className={`transition-all duration-500 ease-in-out ${!imageData && appMode !== 'couple' ? 'flex justify-center' : 'grid md:grid-cols-2 gap-8'} mb-16 animate-fadeIn`}>
             {/* Left Column */}
             <div className={`flex flex-col space-y-6 ${!imageData && appMode !== 'couple' ? 'w-full max-w-xl' : 'w-full'}`}>
                 {appMode === 'couple' ? (
                     <div className="grid grid-cols-2 gap-4">
                        <div className="relative aspect-[3/4] bg-indigo-900/30 rounded-2xl border-2 border-dashed border-indigo-500/30 flex flex-col items-center justify-center hover:bg-indigo-800/30 transition-colors overflow-hidden group">
                            <input type="file" id="p1File" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleCoupleFileChange(e, 'p1')} />
                            <input type="file" id="p1Cam" className="hidden" accept="image/jpeg, image/png, image/webp" capture="user" onChange={(e) => handleCoupleFileChange(e, 'p1')} />
                            {coupleData.p1 ? (
                                <><img src={`data:image/jpeg;base64,${coupleData.p1}`} className="w-full h-full object-cover" alt="P1" /><button onClick={() => setCoupleData(prev => ({...prev, p1: null}))} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">×</button></>
                            ) : (
                                <div className="text-center p-4"><div className="text-4xl mb-2">👦</div><button onClick={() => document.getElementById('p1Cam')?.click()} className="px-3 py-1.5 bg-indigo-600 rounded-full text-xs text-white mb-2">📷 {t.upload.camera}</button><button onClick={() => document.getElementById('p1File')?.click()} className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white">📂 {t.upload.file}</button></div>
                            )}
                        </div>
                        <div className="relative aspect-[3/4] bg-pink-900/20 rounded-2xl border-2 border-dashed border-pink-500/30 flex flex-col items-center justify-center hover:bg-pink-800/20 transition-colors overflow-hidden group">
                            <input type="file" id="p2File" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleCoupleFileChange(e, 'p2')} />
                            <input type="file" id="p2Cam" className="hidden" accept="image/jpeg, image/png, image/webp" capture="user" onChange={(e) => handleCoupleFileChange(e, 'p2')} />
                            {coupleData.p2 ? (
                                <><img src={`data:image/jpeg;base64,${coupleData.p2}`} className="w-full h-full object-cover" alt="P2" /><button onClick={() => setCoupleData(prev => ({...prev, p2: null}))} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">×</button></>
                            ) : (
                                <div className="text-center p-4"><div className="text-4xl mb-2">👧</div><button onClick={() => document.getElementById('p2Cam')?.click()} className="px-3 py-1.5 bg-pink-600 rounded-full text-xs text-white mb-2">📷 {t.upload.camera}</button><button onClick={() => document.getElementById('p2File')?.click()} className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white">📂 {t.upload.file}</button></div>
                            )}
                        </div>
                     </div>
                 ) : !imageData ? (
                     // Centered Upload Box
                     <div className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all hover:border-opacity-100 border-opacity-60 hover:bg-white/5 relative shadow-xl ${appMode === 'career2026' ? 'border-cyan-500' : 'border-indigo-500'}`}>
                        <input type="file" id="singleFileInput" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleSingleFileChange} />
                        <input type="file" id="singleCameraInput" className="hidden" accept="image/jpeg, image/png, image/webp" capture="user" onChange={handleSingleFileChange} />
                        <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner animate-pulse">
                            {appMode === 'daily' ? '🌞' : appMode === 'aging' ? '⏳' : appMode === 'career2026' ? '🚀' : '📸'}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{appMode === 'daily' ? t.daily.title : appMode === 'aging' ? t.aging.title : appMode === 'career2026' ? t.career2026.title : t.upload.title}</h3>
                        <p className="text-indigo-300 text-sm mb-8 leading-relaxed">{appMode === 'aging' ? t.aging.subtitle : appMode === 'career2026' ? t.career2026.subtitle : t.upload.hint}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => document.getElementById('singleCameraInput')?.click()} className={`px-8 py-4 rounded-full font-bold text-white shadow-lg transition-transform transform hover:-translate-y-1 active:scale-95 flex items-center ${appMode === 'career2026' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'}`}>
                                <span className="mr-2 text-xl">📷</span> {t.upload.camera}
                            </button>
                            <button onClick={() => document.getElementById('singleFileInput')?.click()} className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold text-white transition-transform transform hover:-translate-y-1 active:scale-95 flex items-center">
                                <span className="mr-2 text-xl">📂</span> {t.upload.file}
                            </button>
                        </div>
                     </div>
                 ) : (
                     <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 ring-4 ring-white/10 aspect-[4/5] md:aspect-square group">
                         <img src={`data:image/jpeg;base64,${imageData}`} className="w-full h-full object-cover opacity-80" alt="Face" />
                         {/* Face Map Overlay Logic */}
                         {showFaceMap && appMode === 'single' && (
                            <>
                              <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-[10%] border-2 border-dashed border-yellow-400/30 rounded-[45%] opacity-50"></div>
                                <div className="absolute top-[42%] left-[15%] right-[15%] h-px bg-yellow-400/40 flex items-center justify-between"><div className="text-[10px] text-yellow-300 -mt-4 bg-black/50 px-1 rounded">👀</div></div>
                                <div className="absolute top-0 bottom-0 left-[50%] w-px bg-yellow-400/20"></div>
                                <div className="absolute bottom-4 w-full text-center"><span className="bg-black/60 text-yellow-300 text-[10px] px-2 py-1 rounded backdrop-blur">{t.map.guide}</span></div>
                              </div>
                              {facePoints.map(p => (
                                <div key={p.id} className={`absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center cursor-pointer transition-transform duration-300 z-20 ${selectedPoint?.id === p.id ? 'scale-110 z-50' : 'hover:scale-110'}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={(e) => { e.stopPropagation(); setSelectedPoint(p); }}>
                                    <div className={`absolute w-full h-full rounded-full border-2 opacity-50 animate-ping ${selectedPoint?.id === p.id ? 'border-yellow-300' : 'border-indigo-400'}`}></div>
                                    <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] backdrop-blur-sm ${selectedPoint?.id === p.id ? 'bg-yellow-300 ring-4 ring-yellow-500/30' : 'bg-indigo-300 ring-2 ring-indigo-500/30'}`}></div>
                                    {selectedPoint?.id === p.id && (
                                        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-40 bg-indigo-950/80 backdrop-blur-xl border border-yellow-500/40 rounded-xl p-3 shadow-2xl animate-fadeIn origin-top text-center z-50">
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-yellow-500/40"></div>
                                            <div className="text-yellow-300 font-bold text-sm mb-1">{p.name}</div>
                                            <div className="text-white font-medium text-xs bg-white/10 rounded px-2 py-1 inline-block mb-1">{p.shortDesc}</div>
                                            <div className="text-[10px] text-indigo-200 opacity-80 leading-tight">{t.map.ar_tooltip}</div>
                                        </div>
                                    )}
                                </div>
                              ))}
                            </>
                         )}
                         <button onClick={() => { setImageData(null); setAnalysisResult(''); setMirrorImages(null); }} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur transition-all z-40">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                     </div>
                 )}
                 
                 {imageData && appMode === 'single' && (
                    <div className="bg-white/5 rounded-2xl p-1 flex relative">
                        <div className={`absolute top-1 bottom-1 w-1/2 bg-indigo-600 rounded-xl transition-all duration-300 ${mapMode === 'palaces' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-1'}`}></div>
                        <button onClick={() => { setMapMode('palaces'); setSelectedPoint(null); }} className="relative z-10 w-1/2 py-2 text-sm font-medium text-center">{t.map.mode_palace}</button>
                        <button onClick={() => { setMapMode('ages'); setSelectedPoint(null); }} className="relative z-10 w-1/2 py-2 text-sm font-medium text-center">{t.map.mode_age}</button>
                    </div>
                 )}
             </div>

             {/* Right Column (Analysis/Details) */}
             {(imageData || appMode === 'couple') && (
                 <div className="flex flex-col space-y-6">
                    {appMode === 'aging' && imageData && (
                        <div className="bg-indigo-950/30 border border-white/10 rounded-3xl p-6 mb-2">
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleAgingSimulation('virtue')} className={`p-4 rounded-xl border-2 transition-all ${agingPath === 'virtue' ? 'bg-indigo-600 border-yellow-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}><div className="text-3xl mb-2">🧘</div><div className="font-bold text-sm">{t.aging.path_virtue}</div></button>
                                <button onClick={() => handleAgingSimulation('worry')} className={`p-4 rounded-xl border-2 transition-all ${agingPath === 'worry' ? 'bg-indigo-600 border-yellow-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}><div className="text-3xl mb-2">😫</div><div className="font-bold text-sm">{t.aging.path_worry}</div></button>
                            </div>
                        </div>
                    )}

                    {appMode === 'mirror' && mirrorImages && (
                         <div className="grid md:grid-cols-2 gap-4">
                             <div className="bg-indigo-900/30 rounded-xl p-2 text-center"><div className="text-xs text-indigo-300 mb-2">{t.mirror.inner_label}</div><img src={`data:image/jpeg;base64,${mirrorImages.inner}`} className="w-full rounded-lg" /></div>
                             <div className="bg-purple-900/30 rounded-xl p-2 text-center"><div className="text-xs text-purple-300 mb-2">{t.mirror.outer_label}</div><img src={`data:image/jpeg;base64,${mirrorImages.outer}`} className="w-full rounded-lg" /></div>
                         </div>
                    )}

                    {appMode === 'single' && imageData && (
                        <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-3xl p-6 min-h-[150px] flex flex-col justify-center relative overflow-hidden transition-all">
                            {selectedPoint ? (
                                <div className="animate-fadeIn">
                                    <h3 className="text-2xl font-bold text-yellow-300 mb-2">{selectedPoint.name}</h3>
                                    <p className="text-indigo-100 font-light">{selectedPoint.desc}</p>
                                </div>
                            ) : (
                                <div className="text-center text-indigo-400/60"><div className="text-4xl mb-2">👆</div><p>{t.map.select_prompt}</p></div>
                            )}
                        </div>
                    )}

                    {!analysisResult && (
                        <button onClick={analyze} disabled={isLoading || (appMode === 'couple' && (!coupleData.p1 || !coupleData.p2))} 
                            className={`w-full py-4 font-bold text-lg rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                            ${appMode === 'daily' ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' 
                            : appMode === 'career2026' ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white' 
                            : appMode === 'mirror' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-indigo-950'}`}>
                            {isLoading ? t.analysis.btn_loading : (appMode === 'couple' ? `💞 ${t.couple.analyze_btn}` : appMode === 'mirror' ? `🔮 ${t.mirror.analyze_btn}` : t.analysis.btn_start)}
                        </button>
                    )}

                    {analysisResult && (
                        <div id="analysis-result" className="bg-white/90 text-indigo-950 p-6 rounded-3xl shadow-xl animate-fadeIn border-t-8 border-yellow-500">
                             <div className="prose prose-indigo max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap">{analysisResult}</div>
                             <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">{t.analysis.disclaimer}</div>
                        </div>
                    )}
                 </div>
             )}
        </div>

        {appMode === 'single' && <HowItWorksSection t={t} />}
        {appMode === 'single' && <ClassicDiagramSection t={t} />}
        {appMode === 'single' && <EncyclopediaSection t={t} />}
        {appMode === 'mirror' && <MirrorModeExplanation t={t} />}

      </div>
    </div>
  );
};

export default App;