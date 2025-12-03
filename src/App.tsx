import React, { useState, useCallback, ChangeEvent, DragEvent, useRef, useEffect } from 'react';
// 補上這個常數定義，解決 Vercel 找不到 FacePoint 的問題
const FacePoint = {
  LeftEye: 159,
  RightEye: 386,
  NoseTip: 4,
  MouthCenter: 13,
  Chin: 152,
  LeftEyebrow: 46,
  RightEyebrow: 276
};
// -----------------------------------------------------------------------------
// 1. TYPE DEFINITIONS & INTERFACES
// -----------------------------------------------------------------------------

type Language = 'zh-TW' | 'en' | 'ja';
type MapMode = 'palaces' | 'ages'; 
type AppMode = 'single' | 'couple' | 'daily' | 'aging' | 'career2026' | 'mirror' | 'yearly'; // Updated: Added 'yearly'

interface FacePoint {
  id: string;
  name: string;
  shortDesc: string; 
  x: number;
  y: number;
  desc: string;
  book: string;
  ageRange?: string; 
}

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
    yearly: string; // New
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
  yearly: { // New Section
    title: string;
    subtitle: string;
    dob_label: string;
    analyze_btn: string;
    method1_title: string;
    method1_desc: string;
    method2_title: string;
    method2_desc: string;
    result_title: string;
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
    calibrate_btn: string; 
    calibrate_title: string; 
    reset_btn: string; 
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
    wuyue: { title: string; desc: string };
    sidu: { title: string; desc: string };
    wuxing: { title: string; desc: string };
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

// -----------------------------------------------------------------------------
// 2. LOCALIZATION DATA
// -----------------------------------------------------------------------------

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
      mirror: "陰陽顯影鏡",
      yearly: "流年運勢"
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
    yearly: {
      title: "未來兩年流年運勢",
      subtitle: "結合面相流年與生辰八字的雙重預測",
      dob_label: "請輸入您的出生年月日",
      analyze_btn: "分析近兩年運勢",
      method1_title: "方法一：面相流年部位法",
      method1_desc: "依據《麻衣相法》九十九歲流年圖，精確鎖定您未來兩歲對應的臉部位置，分析其氣色與形態。",
      method2_title: "方法二：八字生肖合參",
      method2_desc: "依據您的出生日期推算生肖與基礎命盤，結合當下年份的太歲關係，預測大環境對您的影響。",
      result_title: "流年雙重認證報告"
    },
    map: {
      title: "面相圖解分析",
      mode_palace: "十二宮解析",
      mode_age: "流年運勢圖",
      hint: "* 點擊臉部 AR 標記查看詳細古籍解讀",
      guide: "請將眼睛對準水平線",
      select_prompt: "點擊上方臉部亮點，開啟 AR 解讀...",
      ar_tooltip: "點擊下方查看詳解",
      bg_character: "運",
      calibrate_btn: "校正點位",
      calibrate_title: "拖曳滑桿調整點位",
      reset_btn: "重置"
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
      wuyue: { title: "五嶽 (山脈)", desc: "額為南嶽，頦為北嶽，鼻為中嶽，兩顴為東西嶽。五嶽朝歸，格局宏大。" },
      sidu: { title: "四瀆 (河流)", desc: "耳目口鼻四個孔竅如同江河。深且通暢，象徵財源滾滾。" },
      wuxing: { title: "五星六曜", desc: "額為火星(智)，鼻為土星(財)，眼為日月(神)。星辰明亮，運勢亨通。" },
      palaces: {
        ming: "命宮（印堂）：兩眉之間。這是總樞紐，要寬敞明亮（兩指寬），代表一生願望容易實現。",
        cai: "財帛宮（鼻子）：鼻頭（準頭）代表正財，鼻翼（蘭台廷尉）代表偏財與庫存。",
        guan: "官祿宮（額頭中正）：額頭中央，掌管事業與官運。",
        tian: "田宅宮（眉眼間）：上眼皮位置。寬廣飽滿代表房產運好，家宅安寧。",
        nannv: "男女宮（眼下淚堂）：又稱子女宮。飽滿明潤代表生殖力強，子女優秀；凹陷或氣色黑代表為子女操勞。",
        qiqie: "妻妾宮（眼尾奸門）：太陽穴位置。飽滿代表夫妻和睦；凹陷或有紋痣代表感情多波折。",
        xiongdi: "兄弟宮（眉毛）：看兄弟姊妹助力及交友狀況。",
        jie: "疾厄宮（山根）：兩眼之間鼻樑處。看健康與祖業根基。",
        qianyi: "遷移宮（額角）：髮際線兩側。看外出發展、旅遊運勢。",
        nupu: "奴僕宮（下巴地閣）：下巴兩側。看晚輩、部屬是否得力。",
        fude: "福德宮（眉上）：看祖蔭與個人的福氣底蘊。",
        xiangmao: "相貌宮：統論全臉氣色精神。"
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
    desc_start: "Synthesizing...", desc_highlight: "The Four Classics", desc_end: "...", desc_sub: "...",
    tabs: { single: "Career", couple: "Compatibility", daily: "Daily Qi", aging: "Time Machine", career2026: "2026 Radar", mirror: "Soul Mirror", yearly: "2-Year Fortune" },
    books: { mayi: { title: "Ma Yi", desc: "", details: "" }, liuzhuang: { title: "Liu Zhuang", desc: "", details: "" }, shuijing: { title: "Water Mirror", desc: "", details: "" }, bingjian: { title: "Ice Mirror", desc: "", details: "" } },
    upload: { title: "Upload", ready: "Ready", camera: "Camera", file: "File", hint: "Upload valid image", error_type: "Invalid Type", error_read: "Read Error", error_empty: "Empty" },
    couple: { p1_label: "P1", p2_label: "P2", upload_hint: "Upload both", analyze_btn: "Analyze", match_score: "Score", result_title: "Report" },
    daily: { title: "Daily Qi", subtitle: "", analyze_btn: "Scan", energy_level: "Energy", health_tip: "Tip", fortune_tip: "Fortune" },
    aging: { title: "Time Machine", subtitle: "", path_virtue: "Virtue", path_worry: "Worry", btn_simulate: "Simulate", result_title: "Report", virtue_desc: "", worry_desc: "" },
    career2026: { title: "Career 2026", subtitle: "", analyze_btn: "Predict", trend_title: "Trend", job_title: "Job", ancient_logic: "Roots", future_logic: "Bloom" },
    mirror: { title: "Soul Mirror", subtitle: "", analyze_btn: "Analyze", inner_label: "Inner", outer_label: "Social", upload_hint: "", result_title: "Report", concept_title: "", concept_desc: "", left_face_title: "", left_face_desc: "", right_face_title: "", right_face_desc: "", visual_shock_title: "", visual_shock_desc: "", align_title: "Align", align_desc: "Align", confirm_align: "Confirm", cancel_align: "Cancel" },
    yearly: { title: "2-Year Fortune Forecast", subtitle: "Face Reading + Date of Birth Analysis", dob_label: "Enter your Date of Birth", analyze_btn: "Analyze Next 2 Years", method1_title: "Method 1: Facial Age Map", method1_desc: "Analyzing facial positions corresponding to your specific age.", method2_title: "Method 2: Zodiac & BaZi", method2_desc: "Combining birth date patterns with current yearly energies.", result_title: "Dual-Method Report" },
    map: { title: "Map", mode_palace: "Palaces", mode_age: "Ages", hint: "Tap details", guide: "Align eyes", select_prompt: "Tap point...", ar_tooltip: "Tap below", bg_character: "Luck", calibrate_btn: "Calibrate", calibrate_title: "Adjust", reset_btn: "Reset" },
    diagrams: { title: "Diagrams", subtitle: "", fig1: { title: "", core_logic: "", points: [] }, fig2: { title: "", core_logic: "", points: [] } },
    howItWorks: { title: "How it works", subtitle: "", steps: { step1: { title: "", desc: "" }, step2: { title: "", desc: "" }, step3: { title: "", desc: "" }, step4: { title: "", desc: "" } } },
    encyclopedia: { 
      title: "Encyclopedia", subtitle: "", palaces_title: "", 
      wuyue: { title: "Five Peaks", desc: "Forehead (South), Chin (North), Nose (Center), Cheeks (East/West). Balanced peaks indicate high status and wealth." },
      sidu: { title: "Four Rivers", desc: "Ears, Eyes, Mouth, Nose. Deep and clear 'rivers' symbolize vitality and smooth flow of fortune." },
      wuxing: { title: "Celestial Bodies", desc: "Forehead is Mars (Intellect), Nose is Saturn (Wealth), Eyes are Sun/Moon (Spirit). Bright stars mean good luck." },
      palaces: { ming: "", cai: "", guan: "", tian: "", nannv: "", qiqie: "", xiongdi: "", jie: "", qianyi: "", nupu: "", fude: "", xiangmao: "" } 
    },
    analysis: { btn_start: "Analyze", btn_loading: "Loading...", title: "Report", disclaimer: "Reference only", error_prefix: "Error" },
    ai_prompt_lang: "English"
  },
  'ja': {
    title: "AI 人相占い", subtitle: "", desc_start: "", desc_highlight: "", desc_end: "", desc_sub: "",
    tabs: { single: "キャリア", couple: "相性", daily: "気色", aging: "タイムマシン", career2026: "未来キャリア", mirror: "陰陽ミラー", yearly: "流年運勢" },
    books: { mayi: { title: "", desc: "", details: "" }, liuzhuang: { title: "", desc: "", details: "" }, shuijing: { title: "", desc: "", details: "" }, bingjian: { title: "", desc: "", details: "" } },
    upload: { title: "アップロード", ready: "準備完了", camera: "カメラ", file: "ファイル", hint: "有効な画像を", error_type: "無効な形式", error_read: "読込失敗", error_empty: "空です" },
    couple: { p1_label: "P1", p2_label: "P2", upload_hint: "両方アップロード", analyze_btn: "分析", match_score: "スコア", result_title: "レポート" },
    daily: { title: "気色スキャン", subtitle: "", analyze_btn: "スキャン", energy_level: "エネルギー", health_tip: "健康", fortune_tip: "運勢" },
    aging: { title: "タイムマシン", subtitle: "", path_virtue: "徳", path_worry: "苦労", btn_simulate: "開始", result_title: "レポート", virtue_desc: "", worry_desc: "" },
    career2026: { title: "未来キャリア", subtitle: "", analyze_btn: "予測", trend_title: "トレンド", job_title: "天職", ancient_logic: "根拠", future_logic: "開花" },
    mirror: { title: "陰陽ミラー", subtitle: "", analyze_btn: "分析", inner_label: "内面", outer_label: "外面", upload_hint: "", result_title: "レポート", concept_title: "", concept_desc: "", left_face_title: "", left_face_desc: "", right_face_title: "", right_face_desc: "", visual_shock_title: "", visual_shock_desc: "", align_title: "調整", align_desc: "調整", confirm_align: "確定", cancel_align: "キャンセル" },
    yearly: { title: "二年間運勢予測", subtitle: "人相流年と生年月日の二重予測", dob_label: "生年月日を入力", analyze_btn: "今後二年を分析", method1_title: "方法一：人相流年法", method1_desc: "年齢に対応する顔の部位を分析します。", method2_title: "方法二：干支と八字", method2_desc: "生年月日から干支と星回りを分析します。", result_title: "流年レポート" },
    map: { title: "図解", mode_palace: "十二宮", mode_age: "流年", hint: "詳細", guide: "目を合わせる", select_prompt: "タップ...", ar_tooltip: "詳細", bg_character: "運", calibrate_btn: "位置調整", calibrate_title: "調整", reset_btn: "リセット" },
    diagrams: { title: "図解", subtitle: "", fig1: { title: "", core_logic: "", points: [] }, fig2: { title: "", core_logic: "", points: [] } },
    howItWorks: { title: "仕組み", subtitle: "", steps: { step1: { title: "", desc: "" }, step2: { title: "", desc: "" }, step3: { title: "", desc: "" }, step4: { title: "", desc: "" } } },
    encyclopedia: { 
      title: "百科", subtitle: "", palaces_title: "", 
      wuyue: { title: "五嶽", desc: "額(南)、顎(北)、鼻(中)、頬(東西)。" },
      sidu: { title: "四瀆", desc: "耳目口鼻。" },
      wuxing: { title: "五星", desc: "額は火星、鼻は土星、目は日月。" },
      palaces: { ming: "", cai: "", guan: "", tian: "", nannv: "", qiqie: "", xiongdi: "", jie: "", qianyi: "", nupu: "", fude: "", xiangmao: "" } 
    },
    analysis: { btn_start: "鑑定", btn_loading: "鑑定中...", title: "レポート", disclaimer: "参考のみ", error_prefix: "エラー" },
    ai_prompt_lang: "Japanese"
  }
};

// -----------------------------------------------------------------------------
// 3. HELPER FUNCTIONS & COMPONENTS
// -----------------------------------------------------------------------------

const getFacePoints = (lang: Language, mode: MapMode, adj: {x: number, y: number, scale: number} = {x:0, y:0, scale:1}): FacePoint[] => {
  const isZh = lang === 'zh-TW';
  const isJa = lang === 'ja';
  const t_palaces = TRANSLATIONS[lang].encyclopedia.palaces;
  
  let points: FacePoint[] = [];
  
  if (mode === 'palaces') {
    points = [
      { id: 'guan', name: isZh ? '官祿宮' : isJa ? '官禄宮' : 'Career', shortDesc: isZh ? '事業地位' : isJa ? '仕事運' : 'Career', x: 50, y: 22, desc: t_palaces.guan, book: isZh ? '水鏡' : isJa ? '水鏡' : 'Water Mirror' },
      { id: 'ming', name: isZh ? '命宮(印堂)' : isJa ? '命宮(印堂)' : 'Life', shortDesc: isZh ? '願望樞紐' : isJa ? '願望成就' : 'Destiny Core', x: 50, y: 39, desc: t_palaces.ming, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'ji', name: isZh ? '疾厄宮' : isJa ? '疾厄宮' : 'Health', shortDesc: isZh ? '健康根基' : isJa ? '健康運' : 'Vitality', x: 50, y: 47, desc: t_palaces.jie, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'cai', name: isZh ? '財帛宮' : isJa ? '財帛宮' : 'Wealth', shortDesc: isZh ? '正財庫存' : isJa ? '金運' : 'Wealth', x: 50, y: 62, desc: t_palaces.cai, book: isZh ? '柳莊' : isJa ? '柳莊' : 'Liu Zhuang' },
      { id: 'qian_l', name: isZh ? '遷移宮' : isJa ? '遷移宮' : 'Travel', shortDesc: isZh ? '外出變動' : isJa ? '旅行運' : 'Movement', x: 18, y: 20, desc: t_palaces.qianyi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'qian_r', name: isZh ? '遷移宮' : isJa ? '遷移宮' : 'Travel', shortDesc: isZh ? '外出變動' : isJa ? '旅行運' : 'Movement', x: 82, y: 20, desc: t_palaces.qianyi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'fu_l', name: isZh ? '福德宮' : isJa ? '福徳宮' : 'Fortune', shortDesc: isZh ? '福報祖蔭' : isJa ? '福徳' : 'Blessings', x: 22, y: 28, desc: t_palaces.fude, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      { id: 'fu_r', name: isZh ? '福德宮' : isJa ? '福徳宮' : 'Fortune', shortDesc: isZh ? '福報祖蔭' : isJa ? '福徳' : 'Blessings', x: 78, y: 28, desc: t_palaces.fude, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      { id: 'bro_l', name: isZh ? '兄弟宮' : isJa ? '兄弟宮' : 'Brothers', shortDesc: isZh ? '交友助力' : isJa ? '兄弟運' : 'Siblings', x: 22, y: 34, desc: t_palaces.xiongdi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'bro_r', name: isZh ? '兄弟宮' : isJa ? '兄弟宮' : 'Brothers', shortDesc: isZh ? '交友助力' : isJa ? '兄弟運' : 'Siblings', x: 78, y: 34, desc: t_palaces.xiongdi, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'tian_l', name: isZh ? '田宅宮' : isJa ? '田宅宮' : 'Property', shortDesc: isZh ? '房產家運' : isJa ? '不動産運' : 'Assets', x: 35, y: 42, desc: t_palaces.tian, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'tian_r', name: isZh ? '田宅宮' : isJa ? '田宅宮' : 'Property', shortDesc: isZh ? '房產家運' : isJa ? '不動産運' : 'Assets', x: 65, y: 42, desc: t_palaces.tian, book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'qi_l', name: isZh ? '妻妾宮' : isJa ? '夫妻宮' : 'Marriage', shortDesc: isZh ? '婚姻感情' : isJa ? '恋愛運' : 'Romance', x: 10, y: 44, desc: t_palaces.qiqie, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      { id: 'qi_r', name: isZh ? '妻妾宮' : isJa ? '夫妻宮' : 'Marriage', shortDesc: isZh ? '婚姻感情' : isJa ? '恋愛運' : 'Romance', x: 90, y: 44, desc: t_palaces.qiqie, book: isZh ? '冰鑑' : isJa ? '冰鑑' : 'Ice Mirror' },
      { id: 'zi_l', name: isZh ? '男女宮' : isJa ? '子女宮' : 'Children', shortDesc: isZh ? '子女緣分' : isJa ? '子供運' : 'Offspring', x: 35, y: 52, desc: t_palaces.nannv, book: isZh ? '水鏡' : isJa ? '水鏡' : 'Water Mirror' },
      { id: 'zi_r', name: isZh ? '男女宮' : isJa ? '子女宮' : 'Children', shortDesc: isZh ? '子女緣分' : isJa ? '子供運' : 'Offspring', x: 65, y: 52, desc: t_palaces.nannv, book: isZh ? '水鏡' : isJa ? '水鏡' : 'Water Mirror' },
      { id: 'nu', name: isZh ? '奴僕宮' : isJa ? '奴僕宮' : 'Subordinate', shortDesc: isZh ? '晚輩部屬' : isJa ? '部下運' : 'Leadership', x: 50, y: 90, desc: t_palaces.nupu, book: isZh ? '柳莊' : isJa ? '柳莊' : 'Liu Zhuang' },
    ];
  } else {
    points = [
      { id: 'ear_l', name: isZh ? '童年運(金星)' : isJa ? '幼年運' : 'Childhood', shortDesc: isZh ? '1-14歲' : isJa ? '1-14歳' : 'Age 1-14', x: 8, y: 50, ageRange: '1-14', desc: isZh ? '看左耳。輪廓分明，童年健康好養。' : 'Left Ear. Childhood health.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'ear_r', name: isZh ? '童年運(木星)' : isJa ? '幼年運' : 'Childhood', shortDesc: isZh ? '1-14歲' : isJa ? '1-14歳' : 'Age 1-14', x: 92, y: 50, ageRange: '1-14', desc: isZh ? '看右耳。耳大有福，聰明伶俐。' : isJa ? '右耳。耳が大きければ福がある。' : 'Right Ear. Intelligence.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'fore', name: isZh ? '少年運(火星)' : isJa ? '少年運' : 'Youth', shortDesc: isZh ? '15-30歲' : isJa ? '15-30歳' : 'Age 15-30', x: 50, y: 22, ageRange: '15-30', desc: isZh ? '看額頭。天庭飽滿，少年得志，學業順遂。' : 'Forehead. Academic success in youth.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'brow', name: isZh ? '青年運(羅計)' : isJa ? '青年運' : 'Young Adult', shortDesc: isZh ? '31-34歲' : isJa ? '31-34歳' : 'Age 31-34', x: 50, y: 35, ageRange: '31-34', desc: isZh ? '看眉毛。眉清目秀，貴人多助。' : 'Brows. Social help.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'eye', name: isZh ? '青年運(日月)' : isJa ? '青年運' : 'Young Adult', shortDesc: isZh ? '35-40歲' : isJa ? '35-40歳' : 'Age 35-40', x: 50, y: 44, ageRange: '35-40', desc: isZh ? '看眼睛。眼神含藏，事業衝刺期。' : 'Eyes. Career peak.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'nose', name: isZh ? '中年運(土星)' : isJa ? '中年運' : 'Middle Age', shortDesc: isZh ? '41-50歲' : isJa ? '41-50歳' : 'Age 41-50', x: 50, y: 58, ageRange: '41-50', desc: isZh ? '看鼻準與兩顴。鼻挺顴豐，財富權力高峰。' : 'Nose/Cheeks. Wealth peak.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'mouth', name: isZh ? '晚年運(水星)' : isJa ? '晩年運' : 'Late Life', shortDesc: isZh ? '51-60歲' : isJa ? '51-60歳' : 'Age 51-60', x: 50, y: 78, ageRange: '51-60', desc: isZh ? '看人中與嘴唇。稜角分明，食祿豐厚。' : 'Mouth. Luck in 50s.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
      { id: 'chin', name: isZh ? '晚年運(地閣)' : isJa ? '晩年運' : 'Late Life', shortDesc: isZh ? '61歲後' : isJa ? '61歳以降' : 'Age 61+', x: 50, y: 92, ageRange: '61+', desc: isZh ? '看下巴。圓厚有力，晚景優渥，兒孫滿堂。' : 'Chin. Retirement luck.', book: isZh ? '麻衣' : isJa ? '麻衣' : 'Ma Yi' },
    ];
  }

  // Apply Adjustments
  return points.map(p => ({
    ...p,
    x: 50 + (p.x - 50) * adj.scale + adj.x,
    y: 50 + (p.y - 50) * adj.scale + adj.y
  }));
};

const ScanningOverlay = ({ mode }: { mode: AppMode }) => {
  const colorMap: Record<string, string> = {
    'aging': 'purple',
    'career2026': 'cyan',
    'daily': 'green',
    'mirror': 'indigo',
    'single': 'yellow',
    'couple': 'pink',
    'yearly': 'orange'
  };
  const color = colorMap[mode] || 'yellow';

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-3xl">
      <style>{`
        @keyframes scan-move {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-scan {
          animation: scan-move 2.5s linear infinite;
        }
      `}</style>

      <div className={`absolute left-0 w-full h-2 bg-gradient-to-r from-transparent to-transparent shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-scan opacity-80
        ${color === 'purple' ? 'via-purple-400 shadow-purple-500/50' : 
          color === 'cyan' ? 'via-cyan-400 shadow-cyan-500/50' : 
          color === 'green' ? 'via-green-400 shadow-green-500/50' : 
          color === 'pink' ? 'via-pink-400 shadow-pink-500/50' :
          color === 'orange' ? 'via-orange-400 shadow-orange-500/50' :
          'via-yellow-400 shadow-yellow-500/50'}`}>
      </div>

      <div className={`absolute inset-0 opacity-20 bg-gradient-to-b to-transparent
         ${color === 'purple' ? 'from-purple-500/10' : 
           color === 'cyan' ? 'from-cyan-500/10' : 
           color === 'green' ? 'from-green-500/10' : 
           color === 'orange' ? 'from-orange-500/10' :
           'from-indigo-500/10'}`}>
           <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
    </div>
  );
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
            <p className="text-sm text-indigo-200 text-center leading-relaxed opacity-90">
              {step.data.desc}
            </p>
            
            {idx < 3 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-indigo-500/30 z-0"></div>
            )}
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
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur text-xs text-center text-yellow-300">
                {d.data.title}
              </div>
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
                       <span className="mr-2 mt-1 w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
                       {pt}
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
        
        <div className="inline-block bg-indigo-900/30 rounded-full px-6 py-2 border border-indigo-500/30 text-yellow-300 text-sm font-semibold">
          {t.encyclopedia.palaces_title}
        </div>
      </div>

      {/* Top Concepts Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
          <EncyclopediaCard title={t.encyclopedia.wuyue.title} desc={t.encyclopedia.wuyue.desc} icon="⛰️" />
          <EncyclopediaCard title={t.encyclopedia.sidu.title} desc={t.encyclopedia.sidu.desc} icon="🌊" />
          <EncyclopediaCard title={t.encyclopedia.wuxing.title} desc={t.encyclopedia.wuxing.desc} icon="✨" />
      </div>

      {/* 12 Palaces Grid */}
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
        
        {/* Concept Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 mb-4 bg-indigo-600/30 rounded-full border border-indigo-400/30 text-indigo-200 text-xs tracking-widest uppercase">
            DEEP DIVE
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.mirror.concept_title}</h2>
          <p className="text-indigo-200 max-w-3xl mx-auto leading-relaxed">
            {t.mirror.concept_desc}
          </p>
        </div>

        {/* The Two Faces Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Left Face Card */}
          <div className="bg-indigo-900/30 rounded-2xl p-6 border border-indigo-500/20 hover:bg-indigo-900/50 transition-colors flex flex-col items-center text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">{t.mirror.left_face_title}</h3>
            <div className="w-12 h-1 bg-yellow-500/50 rounded-full mb-4"></div>
            <p className="text-sm text-indigo-100 leading-relaxed">
              {t.mirror.left_face_desc}
            </p>
          </div>

          {/* Right Face Card */}
          <div className="bg-purple-900/30 rounded-2xl p-6 border border-purple-500/20 hover:bg-purple-900/50 transition-colors flex flex-col items-center text-center">
            <div className="text-5xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-purple-300 mb-2">{t.mirror.right_face_title}</h3>
            <div className="w-12 h-1 bg-purple-500/50 rounded-full mb-4"></div>
            <p className="text-sm text-indigo-100 leading-relaxed">
              {t.mirror.right_face_desc}
            </p>
          </div>
        </div>

        {/* Visual Shock & Logic */}
        <div className="bg-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
           <div className="flex-shrink-0 bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30">
             ⚡
           </div>
           <div className="text-center md:text-left">
             <h3 className="text-lg font-bold text-white mb-2">{t.mirror.visual_shock_title}</h3>
             <p className="text-indigo-200 text-sm leading-relaxed">
               {t.mirror.visual_shock_desc}
             </p>
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
          {/* Image */}
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

          {/* Guides Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
             {/* Center Line (Nose) */}
             <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-yellow-400/70 -translate-x-1/2 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
             {/* Eye Line */}
             <div className="absolute top-[42%] left-0 right-0 h-0.5 bg-yellow-400/50 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
             {/* Oval Face Guide */}
             <div className="absolute top-[10%] bottom-[10%] left-[20%] right-[20%] border-2 border-dashed border-white/30 rounded-[50%]"></div>
          </div>
        </div>

        {/* Controls */}
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
             <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all">
                 {t.mirror.cancel_align}
             </button>
             <button onClick={confirm} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg transition-all">
                {t.mirror.confirm_align}
             </button>
          </div>
        </div>
        
        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

const YearlyFortuneSection: React.FC<{
  imageData: string;
  onAnalyze: (dob: string) => void;
  t: Translation;
}> = ({ imageData, onAnalyze, t }) => {
  const [dob, setDob] = useState('');

  return (
    <div className="animate-fadeIn bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-6 md:p-8 mt-4">
       <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{t.yearly.title}</h2>
          <p className="text-indigo-300 text-sm">{t.yearly.subtitle}</p>
       </div>

       <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Method 1 Card */}
          <div className="bg-indigo-900/40 p-5 rounded-2xl border border-indigo-500/20">
             <div className="text-3xl mb-3">🧒</div>
             <h3 className="text-lg font-bold text-yellow-300 mb-2">{t.yearly.method1_title}</h3>
             <p className="text-sm text-indigo-200 leading-relaxed">{t.yearly.method1_desc}</p>
          </div>
          {/* Method 2 Card */}
          <div className="bg-indigo-900/40 p-5 rounded-2xl border border-indigo-500/20">
             <div className="text-3xl mb-3">📅</div>
             <h3 className="text-lg font-bold text-yellow-300 mb-2">{t.yearly.method2_title}</h3>
             <p className="text-sm text-indigo-200 leading-relaxed">{t.yearly.method2_desc}</p>
          </div>
       </div>

       {/* DOB Input */}
       <div className="max-w-sm mx-auto bg-white/5 p-6 rounded-2xl border border-white/10">
          <label className="block text-sm font-medium text-indigo-200 mb-3 text-center">
             {t.yearly.dob_label}
          </label>
          <input 
            type="date" 
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full bg-indigo-950 text-white border border-indigo-500/50 rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-6 appearance-none"
            style={{ colorScheme: 'dark' }}
          />
          <button 
             onClick={() => dob && onAnalyze(dob)}
             disabled={!dob}
             className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
             {t.yearly.analyze_btn}
          </button>
       </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. MAIN APPLICATION COMPONENT
// -----------------------------------------------------------------------------

const App: React.FC = () => {
  // State
  const [appMode, setAppMode] = useState<AppMode>('single');
  const [imageData, setImageData] = useState<string | null>(null);
  const [coupleData, setCoupleData] = useState<{ p1: string | null; p2: string | null }>({ p1: null, p2: null });
  const [agingPath, setAgingPath] = useState<'virtue' | 'worry' | null>(null);
  const [mirrorImages, setMirrorImages] = useState<{ inner: string; outer: string } | null>(null);
  const [isAligning, setIsAligning] = useState(false);
  const [userDob, setUserDob] = useState<string>(''); // For Yearly Fortune
  
  // New state for map adjustment (Calibration)
  const [mapAdjustment, setMapAdjustment] = useState({ x: 0, y: 0, scale: 1 });
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<Language>('zh-TW');
  
  // UX States
  const [showFaceMap, setShowFaceMap] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<MapMode>('palaces');
  const [selectedPoint, setSelectedPoint] = useState<FacePoint | null>(null);

  const t = TRANSLATIONS[language];
  const facePoints = getFacePoints(language, mapMode, mapAdjustment);
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
  
  // Yearly Fortune Handler
  const handleYearlyFortune = async (dob: string) => {
      setUserDob(dob);
      setIsLoading(true);
      setError('');
      setAnalysisResult('');
      
      if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }

      const systemPrompt = `你是一位精通 **《麻衣相法》流年部位** 與 **生辰八字/生肖** 的命理大師。
      請結合用戶的「面相照片」與「出生日期」(${dob})，預測未來兩年的詳細運勢。
      
      **分析方法 (雙重驗證)**：
      1. **面相流年法**：根據出生日期計算實歲與虛歲，精確找出未來兩年對應的臉部「流年部位」（例如：30歲看眉，41歲看山根）。觀察照片中該部位的氣色、飽滿度、是否有紋路沖破。
      2. **八字/生肖流年法**：根據出生年推算生肖，分析其與未來兩年（例如：蛇年、馬年）的太歲關係（沖、合、刑、害）及五行生剋。

      **輸出結構 (社群風格)**：
      1. **🗓️ 您的流年座標**：指出目前虛歲與對應的面相部位。
      2. **📜 未來兩年運勢總論**：(Emoji) 總評。
      3. **🔮 第一年 (${new Date().getFullYear() + 1}) 預測**：
         - **面相視角**：引用古籍口訣（如「眉清目秀...」）。
         - **生肖視角**：太歲關係分析。
         - **白話建議**：工作/感情/財運。
      4. **🔮 第二年 (${new Date().getFullYear() + 2}) 預測**：同上。
      5. **💡 開運錦囊**：結合兩種分析的綜合建議。

      語氣：專業、精準、正向賦能。語言：${t.ai_prompt_lang}。請勿使用Markdown符號。`;

      const userQuery = `Analyze yearly fortune for DOB: ${dob}. Language: ${t.ai_prompt_lang}. No Markdown.`;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: imageData } }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          }),
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
    
    const bookDefinitions = `
    參考典籍與分析重點：
    1. 《麻衣相法》：以「五官、十二宮、十三部位、流年運勢」為骨架，分析基礎命理架構。
    2. 《柳莊相法》：注重「氣色觀人」與「動態神情」，強調「面相會變」，分析當下吉凶與變數。
    3. 《水鏡相法》：重在分辨「忠奸賢愚」，分析性格本質與實用性的人際互動。
    4. 《冰鑑》：從「神、骨、氣、色、音、態」整體觀人，分析內在精神格局與潛力。
    `;

    if (appMode === 'single') {
        if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
        systemPrompt = `你同時身兼兩位頂尖導師的角色... ${bookDefinitions} ... (省略)`; 
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
    // Yearly mode is handled by handleYearlyFortune
    
    if (appMode !== 'yearly') {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ role: "user", parts: parts }], systemInstruction: { parts: [{ text: systemPrompt }] } }),
            });
            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) setAnalysisResult(text.replace(/[*#]/g, '')); else throw new Error("No result");
        } catch (e) { setError(t.analysis.error_prefix + " Connection failed."); } finally { setIsLoading(false); }
    }
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
             <div className="flex flex-wrap justify-center gap-3">
                {(['single', 'couple', 'daily', 'aging', 'career2026', 'mirror', 'yearly'] as AppMode[]).map(mode => {
                    const iconMap: Record<AppMode, string> = {
                        single: '👤', couple: '❤️', daily: '☀️', aging: '⏳', career2026: '🚀', mirror: '🎭', yearly: '📅'
                    };
                    return (
                        <button key={mode} onClick={() => { setAppMode(mode); setAnalysisResult(''); setError(''); }} 
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${appMode === mode ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-105 ring-2 ring-indigo-400/50' : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/60 hover:text-white'}`}>
                           <span>{iconMap[mode]}</span> {t.tabs[mode]}
                        </button>
                    );
                })}
             </div>
          </div>
        </div>

        {isAligning && imageData && <ImageAligner imageData={imageData} onConfirm={handleAlignmentConfirm} onCancel={handleAlignmentCancel} t={t} />}

        {/* ... (Books Grid - unchanged) */}
        {appMode === 'single' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <BookBadge title={t.books.mayi.title} titleEn="Ma Yi" desc={t.books.mayi.desc} icon="📜" details={t.books.mayi.details} />
                <BookBadge title={t.books.liuzhuang.title} titleEn="Liu Zhuang" desc={t.books.liuzhuang.desc} icon="👀" details={t.books.liuzhuang.details} />
                <BookBadge title={t.books.shuijing.title} titleEn="Water Mirror" desc={t.books.shuijing.desc} icon="⚖️" details={t.books.shuijing.details} />
                <BookBadge title={t.books.bingjian.title} titleEn="Ice Mirror" desc={t.books.bingjian.desc} icon="🧊" details={t.books.bingjian.details} />
            </div>
        )}

        <div className={`transition-all duration-500 ease-in-out ${(!imageData && appMode !== 'couple') || appMode === 'yearly' ? 'flex justify-center' : 'grid md:grid-cols-2 gap-8'} mb-16 animate-fadeIn`}>
             {/* Left Column / Center Container */}
             <div className={`flex flex-col space-y-6 ${(!imageData && appMode !== 'couple') || appMode === 'yearly' ? 'w-full max-w-xl' : 'w-full'}`}>
                 
                 {/* Couple Mode Uploads */}
                 {appMode === 'couple' && (
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
                 )}
                 
                 {/* Standard Single Upload (Hidden in Yearly unless no image, hidden in Couple) */}
                 {appMode !== 'couple' && !imageData && (
                     <div className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all hover:border-opacity-100 border-opacity-60 hover:bg-white/5 relative shadow-xl ${appMode === 'career2026' ? 'border-cyan-500' : 'border-indigo-500'}`}>
                        <input type="file" id="singleFileInput" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleSingleFileChange} />
                        <input type="file" id="singleCameraInput" className="hidden" accept="image/jpeg, image/png, image/webp" capture="user" onChange={handleSingleFileChange} />
                        <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner animate-pulse">
                            {appMode === 'daily' ? '🌞' : appMode === 'aging' ? '⏳' : appMode === 'career2026' ? '🚀' : appMode === 'yearly' ? '📅' : '📸'}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{appMode === 'daily' ? t.daily.title : appMode === 'aging' ? t.aging.title : appMode === 'career2026' ? t.career2026.title : appMode === 'yearly' ? t.yearly.title : t.upload.title}</h3>
                        <p className="text-indigo-300 text-sm mb-8 leading-relaxed">{appMode === 'aging' ? t.aging.subtitle : appMode === 'career2026' ? t.career2026.subtitle : appMode === 'yearly' ? t.yearly.subtitle : t.upload.hint}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => document.getElementById('singleCameraInput')?.click()} className={`px-8 py-4 rounded-full font-bold text-white shadow-lg transition-transform transform hover:-translate-y-1 active:scale-95 flex items-center ${appMode === 'career2026' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'}`}>
                                <span className="mr-2 text-xl">📷</span> {t.upload.camera}
                            </button>
                            <button onClick={() => document.getElementById('singleFileInput')?.click()} className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold text-white transition-transform transform hover:-translate-y-1 active:scale-95 flex items-center">
                                <span className="mr-2 text-xl">📂</span> {t.upload.file}
                            </button>
                        </div>
                     </div>
                 )}

                 {/* Image Display (Single modes) */}
                 {imageData && appMode !== 'couple' && appMode !== 'yearly' && (
                     <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 ring-4 ring-white/10 aspect-[4/5] md:aspect-square group">
                         <img src={`data:image/jpeg;base64,${imageData}`} className="w-full h-full object-cover opacity-80" alt="Face" />
                         {isLoading && <ScanningOverlay mode={appMode} />}
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
                 
                 {/* Map Controls (Single Mode Only) */}
                 {imageData && appMode === 'single' && (
                    <div className="flex flex-col gap-2">
                        <div className="bg-white/5 rounded-2xl p-1 flex relative">
                            <div className={`absolute top-1 bottom-1 w-1/2 bg-indigo-600 rounded-xl transition-all duration-300 ${mapMode === 'palaces' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-1'}`}></div>
                            <button onClick={() => { setMapMode('palaces'); setSelectedPoint(null); }} className="relative z-10 w-1/2 py-2 text-sm font-medium text-center">{t.map.mode_palace}</button>
                            <button onClick={() => { setMapMode('ages'); setSelectedPoint(null); }} className="relative z-10 w-1/2 py-2 text-sm font-medium text-center">{t.map.mode_age}</button>
                        </div>
                        {isCalibrating ? (
                            <div className="bg-indigo-900/50 p-4 rounded-2xl border border-yellow-500/30 animate-fadeIn">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-yellow-300 font-bold">{t.map.calibrate_title}</span>
                                    <button onClick={() => setMapAdjustment({x:0, y:0, scale:1})} className="text-[10px] text-indigo-300 hover:text-white bg-white/10 px-2 py-0.5 rounded">{t.map.reset_btn}</button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2"><span className="text-xs w-8 text-indigo-300">Y</span><input type="range" min="-30" max="30" value={mapAdjustment.y} onChange={e => setMapAdjustment({...mapAdjustment, y: Number(e.target.value)})} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400" /></div>
                                    <div className="flex items-center gap-2"><span className="text-xs w-8 text-indigo-300">X</span><input type="range" min="-20" max="20" value={mapAdjustment.x} onChange={e => setMapAdjustment({...mapAdjustment, x: Number(e.target.value)})} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400" /></div>
                                    <div className="flex items-center gap-2"><span className="text-xs w-8 text-indigo-300">Size</span><input type="range" min="0.8" max="1.2" step="0.05" value={mapAdjustment.scale} onChange={e => setMapAdjustment({...mapAdjustment, scale: Number(e.target.value)})} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400" /></div>
                                </div>
                                <button onClick={() => setIsCalibrating(false)} className="w-full mt-3 py-1.5 bg-indigo-600 rounded-lg text-xs text-white">Done</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsCalibrating(true)} className="text-xs text-indigo-400 hover:text-yellow-300 text-center w-full py-1">🔧 {t.map.calibrate_btn}</button>
                        )}
                    </div>
                 )}

                 {/* Yearly Mode Section */}
                 {appMode === 'yearly' && imageData && (
                     <YearlyFortuneSection imageData={imageData} onAnalyze={handleYearlyFortune} t={t} />
                 )}
             </div>

             {/* Right Column: Analysis & Output */}
             {/* Render this column if there is image data OR if we are in Couple mode OR if in Yearly mode with result */}
             {(imageData || appMode === 'couple' || (appMode === 'yearly' && imageData)) && (
                 <div className="flex flex-col space-y-6">
                    {/* Aging Controls */}
                    {appMode === 'aging' && imageData && (
                        <div className="bg-indigo-950/30 border border-white/10 rounded-3xl p-6 mb-2">
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleAgingSimulation('virtue')} className={`p-4 rounded-xl border-2 transition-all ${agingPath === 'virtue' ? 'bg-indigo-600 border-yellow-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}><div className="text-3xl mb-2">🧘</div><div className="font-bold text-sm">{t.aging.path_virtue}</div></button>
                                <button onClick={() => handleAgingSimulation('worry')} className={`p-4 rounded-xl border-2 transition-all ${agingPath === 'worry' ? 'bg-indigo-600 border-yellow-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}><div className="text-3xl mb-2">😫</div><div className="font-bold text-sm">{t.aging.path_worry}</div></button>
                            </div>
                        </div>
                    )}

                    {/* Mirror Display */}
                    {appMode === 'mirror' && mirrorImages && (
                         <div className="grid md:grid-cols-2 gap-4">
                             <div className="bg-indigo-900/30 rounded-xl p-2 text-center"><div className="text-xs text-indigo-300 mb-2">{t.mirror.inner_label}</div><img src={`data:image/jpeg;base64,${mirrorImages.inner}`} className="w-full rounded-lg" /></div>
                             <div className="bg-purple-900/30 rounded-xl p-2 text-center"><div className="text-xs text-purple-300 mb-2">{t.mirror.outer_label}</div><img src={`data:image/jpeg;base64,${mirrorImages.outer}`} className="w-full rounded-lg" /></div>
                         </div>
                    )}

                    {/* Point Details (Single Mode Only) */}
                    {appMode === 'single' && imageData && (
                        <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-3xl p-6 min-h-[150px] flex flex-col justify-center relative overflow-hidden transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-serif">{t.map.bg_character}</div>
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

                    {/* Analysis Trigger Button (Hidden for Aging/Yearly as they have own triggers) */}
                    {!analysisResult && appMode !== 'aging' && appMode !== 'yearly' && (
                        <button onClick={analyze} disabled={isLoading || (appMode === 'couple' && (!coupleData.p1 || !coupleData.p2))} 
                            className={`w-full py-4 font-bold text-lg rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                            ${appMode === 'daily' ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' 
                            : appMode === 'career2026' ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white' 
                            : appMode === 'mirror' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-indigo-950'}`}>
                            {isLoading ? t.analysis.btn_loading : (appMode === 'couple' ? `💞 ${t.couple.analyze_btn}` : appMode === 'mirror' ? `🔮 ${t.mirror.analyze_btn}` : t.analysis.btn_start)}
                        </button>
                    )}

                    {/* Result Output */}
                    {analysisResult && (
                        <div id="analysis-result" className={`bg-white/90 text-indigo-950 p-6 rounded-3xl shadow-xl animate-fadeIn border-t-8 
                           ${appMode === 'daily' ? 'border-green-500' : appMode === 'yearly' ? 'border-orange-500' : 'border-yellow-500'}`}>
                             {appMode === 'yearly' && <h3 className="text-xl font-bold mb-4 text-center">📅 {t.yearly.result_title}</h3>}
                             <div className="prose prose-indigo max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap">{analysisResult}</div>
                             <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">{t.analysis.disclaimer}</div>
                        </div>
                    )}

                    {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm text-center">{error}</div>}
                 </div>
             )}
        </div>

        {/* Shared Footer Sections */}
        {appMode === 'single' && <HowItWorksSection t={t} />}
        {appMode === 'single' && <ClassicDiagramSection t={t} />}
        {appMode === 'single' && <EncyclopediaSection t={t} />}
        {appMode === 'mirror' && <MirrorModeExplanation t={t} />}

      </div>
    </div>
  );
};

export default App;