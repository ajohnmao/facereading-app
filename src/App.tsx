import React, { useState, useCallback, ChangeEvent, DragEvent, useRef, useEffect } from 'react';
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
type AppMode = 'single' | 'couple' | 'daily' | 'aging' | 'career2027' | 'mirror' | 'yearly';
type Theme = 'dark' | 'light';

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
    career2027: string;
    mirror: string;
    yearly: string;
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
    demo: string;
    hint: string;
    privacy: string;
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
  career2027: {
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
  yearly: { 
    title: string;
    subtitle: string;
    dob_label: string;
    tob_label: string;
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
    download_btn: string;
  };
  payment: {
    pro_badge: string;
    unlock_btn: string;
    modal_title: string;
    modal_desc: string;
    plan_price: string;
    buy_btn: string;
    redeem_btn: string;
    redeem_placeholder: string;
    redeem_hint: string; 
    verify_btn: string;
    success: string;
    feature_1: string;
    feature_2: string;
    feature_3: string;
    locked_content: string;
    gumroad_url: string; 
  }
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
      career2027: "2027 職涯分析",
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
      demo: "使用人臉範例試玩",
      hint: "請確保光線充足、五官清晰的正臉照 (JPG/PNG)",
      privacy: "隱私承諾：照片僅供 AI 引擎即時分析，分析完畢立即銷毀，絕不儲存於任何伺服器。",
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
    career2027: {
      title: "2027 職涯趨勢雷達",
      subtitle: "面相格局 × 丁未年火土氣場分析",
      analyze_btn: "預測 2027 轉職與貴人運",
      trend_title: "2027 丁未年關鍵字：精緻、虛實整合、心靈",
      job_title: "您的 2027 天命職業",
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
      subtitle: "面相氣色 × 八字紫微 雙重精算",
      dob_label: "出生日期",
      tob_label: "出生時間 (時辰)",
      analyze_btn: "分析近兩年運勢",
      method1_title: "系統一：八字命理 (四柱八字)",
      method1_desc: "以出生四柱推算「日主強弱」與「五行生剋」。重點分析大運週期與 2027(羊)/2028(猴) 的太歲關係。",
      method2_title: "系統二：紫微斗數 (十二宮)",
      method2_desc: "依時辰安星，透過「星曜組合」與「四化飛星」（祿權科忌）推斷具體的人事際遇與事件誘因。",
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
      error_prefix: "分析受阻：",
      download_btn: "下載報告 (PDF)"
    },
    payment: {
      pro_badge: "PRO",
      unlock_btn: "解鎖完整分析",
      modal_title: "升級 PRO 會員",
      modal_desc: "解鎖所有高階功能：陰陽顯影鏡、流年運勢詳批、以及未來修煉指南。",
      plan_price: "NT$ 299 / 次",
      buy_btn: "前往 Gumroad 購買",
      redeem_btn: "我已有序號",
      redeem_placeholder: "請輸入 License Key 或 devtest", 
      redeem_hint: "購買後，序號將顯示於付款成功頁面。",
      verify_btn: "驗證並解鎖",
      success: "序號驗證成功！正在解鎖...",
      feature_1: "🔓 解鎖 陰陽顯影鏡 (潛意識分析)",
      feature_2: "🔓 解鎖 2026-2027 流年詳批", 
      feature_3: "🔓 解鎖 未來修煉與改運指南",
      locked_content: "🔒 此內容為 PRO 會員限定，請升級以查看完整分析。",
      gumroad_url: "https://ajohnsmith.gumroad.com/l/osrgbd"
    },
    ai_prompt_lang: "繁體中文"
  },
  // ... (EN and JA translations same as before, omitted for brevity)
  'en': {
    title: "AI Physiognomy Master", subtitle: "Ancient Wisdom, Modern Tech", desc_start: "Synthesizing...", desc_highlight: "The Four Classics", desc_end: "...", desc_sub: "...",
    tabs: { single: "Career", couple: "Compatibility", daily: "Daily Qi", aging: "Time Machine", career2027: "2027 Career", mirror: "Soul Mirror", yearly: "2-Year Fortune" },
    books: { mayi: { title: "Ma Yi", desc: "", details: "" }, liuzhuang: { title: "Liu Zhuang", desc: "", details: "" }, shuijing: { title: "Water Mirror", desc: "", details: "" }, bingjian: { title: "Ice Mirror", desc: "", details: "" } },
    upload: { title: "Upload", ready: "Ready", camera: "Camera", file: "File", demo: "Try Demo", hint: "Upload valid image", privacy: "Privacy: Photos are analyzed in real-time and NOT stored.", error_type: "Invalid Type", error_read: "Read Error", error_empty: "Empty" },
    couple: { p1_label: "P1", p2_label: "P2", upload_hint: "Upload both", analyze_btn: "Analyze", match_score: "Score", result_title: "Report" },
    daily: { title: "Daily Qi", subtitle: "", analyze_btn: "Scan", energy_level: "Energy", health_tip: "Tip", fortune_tip: "Fortune" },
    aging: { title: "Time Machine", subtitle: "", path_virtue: "Virtue", path_worry: "Worry", btn_simulate: "Simulate", result_title: "Report", virtue_desc: "", worry_desc: "" },
    career2027: { title: "Career 2027", subtitle: "Face & 2027 Energy Trends", analyze_btn: "Predict 2027 Destiny", trend_title: "2027 Trends: Refinement, Virtual-Real, Spirit", job_title: "Your 2027 Destiny Career", ancient_logic: "Roots", future_logic: "Bloom" },
    mirror: { title: "Soul Mirror", subtitle: "", analyze_btn: "Analyze", inner_label: "Inner", outer_label: "Social", upload_hint: "", result_title: "Report", concept_title: "", concept_desc: "", left_face_title: "", left_face_desc: "", right_face_title: "", right_face_desc: "", visual_shock_title: "", visual_shock_desc: "", align_title: "Align", align_desc: "Drag & Zoom to align", confirm_align: "Confirm", cancel_align: "Cancel" },
    yearly: { title: "2027-2028 Fortune", subtitle: "Physiognomy + BaZi + Zi Wei", dob_label: "Date of Birth", tob_label: "Time of Birth", analyze_btn: "Analyze 2 Years", method1_title: "Method 1: BaZi (Four Pillars)", method1_desc: "Uses birth pillars to analyze Five Elements balance and yearly clashes.", method2_title: "Method 2: Zi Wei Dou Shu", method2_desc: "Uses 12 Palaces and Star combinations for detailed event prediction.", result_title: "2027-2028 Report" },
    map: { title: "Map", mode_palace: "Palaces", mode_age: "Ages", hint: "Tap details", guide: "Align eyes", select_prompt: "Tap point...", ar_tooltip: "Tap below", bg_character: "Luck", calibrate_btn: "Calibrate", calibrate_title: "Adjust", reset_btn: "Reset" },
    diagrams: { title: "Diagrams", subtitle: "", fig1: { title: "", core_logic: "", points: [] }, fig2: { title: "", core_logic: "", points: [] } },
    howItWorks: { title: "How it works", subtitle: "", steps: { step1: { title: "", desc: "" }, step2: { title: "", desc: "" }, step3: { title: "", desc: "" }, step4: { title: "", desc: "" } } },
    encyclopedia: { 
      title: "Encyclopedia", subtitle: "", palaces_title: "", 
      wuyue: { title: "Five Peaks", desc: "" }, sidu: { title: "Four Rivers", desc: "" }, wuxing: { title: "Celestial Bodies", desc: "" }, palaces: { ming: "", cai: "", guan: "", tian: "", nannv: "", qiqie: "", xiongdi: "", jie: "", qianyi: "", nupu: "", fude: "", xiangmao: "" } 
    },
    analysis: { btn_start: "Analyze", btn_loading: "Loading...", title: "Report", disclaimer: "Reference only", error_prefix: "Error", download_btn: "Download PDF" },
    payment: {
      pro_badge: "PRO", unlock_btn: "Unlock Full Report", modal_title: "Upgrade to PRO", modal_desc: "Unlock advanced features.", plan_price: "$9.99", buy_btn: "Buy on Gumroad", redeem_btn: "I have a Key", redeem_placeholder: "Enter License Key", redeem_hint: "Key is sent to your email after purchase.", verify_btn: "Verify", success: "Success!",
      feature_1: "Unlock Soul Mirror", feature_2: "Unlock 2027-2028 Yearly Forecast", feature_3: "Unlock Guide", locked_content: "Locked Content", gumroad_url: "https://ajohnsmith.gumroad.com/l/osrgbd"
    },
    ai_prompt_lang: "English"
  },
  'ja': {
    title: "AI 人相占い", subtitle: "", desc_start: "", desc_highlight: "", desc_end: "", desc_sub: "",
    tabs: { single: "キャリア", couple: "相性", daily: "気色", aging: "タイムマシン", career2027: "2027 未来キャリア", mirror: "陰陽ミラー", yearly: "流年運勢" },
    books: { mayi: { title: "", desc: "", details: "" }, liuzhuang: { title: "", desc: "", details: "" }, shuijing: { title: "", desc: "", details: "" }, bingjian: { title: "", desc: "", details: "" } },
    upload: { title: "アップロード", ready: "準備完了", camera: "カメラ", file: "ファイル", demo: "デモを試す", hint: "有効な画像を", privacy: "プライバシー：写真はリアルタイムで分析され、保存されません。", error_type: "無効な形式", error_read: "読込失敗", error_empty: "空です" },
    couple: { p1_label: "P1", p2_label: "P2", upload_hint: "両方アップロード", analyze_btn: "分析", match_score: "スコア", result_title: "レポート" },
    daily: { title: "気色スキャン", subtitle: "", analyze_btn: "スキャン", energy_level: "エネルギー", health_tip: "健康", fortune_tip: "運勢" },
    aging: { title: "タイムマシン", subtitle: "", path_virtue: "徳", path_worry: "苦労", btn_simulate: "開始", result_title: "レポート", virtue_desc: "", worry_desc: "" },
    career2027: { title: "2027 未来キャリア", subtitle: "面相 × 丁未年（ひのとひつじ）", analyze_btn: "2027年の天職を予測", trend_title: "2027年トレンド：精神、美学、バーチャル", job_title: "あなたの2027年の天職", ancient_logic: "根拠", future_logic: "開花" },
    mirror: { title: "陰陽ミラー", subtitle: "", analyze_btn: "分析", inner_label: "内面", outer_label: "外面", upload_hint: "", result_title: "レポート", concept_title: "", concept_desc: "", left_face_title: "", left_face_desc: "", right_face_title: "", right_face_desc: "", visual_shock_title: "", visual_shock_desc: "", align_title: "調整", align_desc: "調整", confirm_align: "確定", cancel_align: "キャンセル" },
    yearly: { title: "2027-2028 運勢", subtitle: "人相 + 八字 + 紫微斗数", dob_label: "生年月日", tob_label: "出生時間", analyze_btn: "今後二年を分析", method1_title: "方法一：八字命理", method1_desc: "生年月日時の四柱から五行のバランスと大運を分析。", method2_title: "方法二：紫微斗数", method2_desc: "十二宮と星の配置から、具体的な出来事や心理を推断。", result_title: "流年レポート" },
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
    analysis: { btn_start: "鑑定", btn_loading: "鑑定中...", title: "レポート", disclaimer: "参考のみ", error_prefix: "エラー", download_btn: "PDF" },
    payment: {
      pro_badge: "PRO", unlock_btn: "完全版を解除", modal_title: "PROにアップグレード", modal_desc: "全機能解除", plan_price: "¥480", buy_btn: "購入", redeem_btn: "コード入力", redeem_placeholder: "コード", redeem_hint: "購入後にメールで送信されます", verify_btn: "認証", success: "成功",
      feature_1: "陰陽ミラー", feature_2: "2027-2028 流年運勢", feature_3: "開運ガイド", locked_content: "PRO限定", gumroad_url: "https://ajohnsmith.gumroad.com/l/osrgbd"
    },
    ai_prompt_lang: "Japanese"
  }
};

// -----------------------------------------------------------------------------
// 3. HELPER FUNCTIONS & COMPONENTS
// -----------------------------------------------------------------------------

const getFacePoints = (lang: Language, mode: MapMode, adj: {x: number, y: number, scale: number} = {x:0, y:0, scale:1}): FacePoint[] => {
  const isZh = lang === 'zh-TW';
  const isJa = lang === 'ja';
  const t_palaces = TRANSLATIONS[lang]?.encyclopedia?.palaces || TRANSLATIONS['zh-TW'].encyclopedia.palaces;
  
  let points: FacePoint[] = [];
  
  if (mode === 'palaces') {
    points = [
      { id: 'guan', name: isZh ? '官祿' : isJa ? '官禄' : 'Career', shortDesc: isZh ? '事業地位' : 'Career', x: 50, y: 32, desc: t_palaces.guan, book: isZh ? '水鏡' : 'Water Mirror' },
      { id: 'ming', name: isZh ? '命宮' : isJa ? '命宮' : 'Life', shortDesc: isZh ? '願望樞紐' : 'Destiny', x: 50, y: 42, desc: t_palaces.ming, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'ji', name: isZh ? '疾厄' : isJa ? '疾厄' : 'Health', shortDesc: isZh ? '健康根基' : 'Health', x: 50, y: 48, desc: t_palaces.jie, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'cai', name: isZh ? '財帛' : isJa ? '財帛' : 'Wealth', shortDesc: isZh ? '正財庫存' : 'Wealth', x: 50, y: 58, desc: t_palaces.cai, book: isZh ? '柳莊' : 'Liu Zhuang' },
      { id: 'tian_l', name: isZh ? '田宅' : isJa ? '田宅' : 'Prop.', shortDesc: isZh ? '房產' : 'Assets', x: 38, y: 44, desc: t_palaces.tian, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'tian_r', name: isZh ? '田宅' : isJa ? '田宅' : 'Prop.', shortDesc: isZh ? '房產' : 'Assets', x: 62, y: 44, desc: t_palaces.tian, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'nannv_l', name: isZh ? '男女' : isJa ? '男女' : 'Child', shortDesc: isZh ? '子女' : 'Kids', x: 38, y: 50, desc: t_palaces.nannv, book: isZh ? '水鏡' : 'Water Mirror' },
      { id: 'nannv_r', name: isZh ? '男女' : isJa ? '男女' : 'Child', shortDesc: isZh ? '子女' : 'Kids', x: 62, y: 50, desc: t_palaces.nannv, book: isZh ? '水鏡' : 'Water Mirror' },
      { id: 'qiqie_l', name: isZh ? '夫妻' : isJa ? '夫妻' : 'Spouse', shortDesc: isZh ? '婚姻' : 'Love', x: 28, y: 45, desc: t_palaces.qiqie, book: isZh ? '冰鑑' : 'Ice Mirror' },
      { id: 'qiqie_r', name: isZh ? '夫妻' : isJa ? '夫妻' : 'Spouse', shortDesc: isZh ? '婚姻' : 'Love', x: 72, y: 45, desc: t_palaces.qiqie, book: isZh ? '冰鑑' : 'Ice Mirror' },
      { id: 'qianyi_l', name: isZh ? '遷移' : isJa ? '遷移' : 'Travel', shortDesc: isZh ? '變動' : 'Travel', x: 25, y: 28, desc: t_palaces.qianyi, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'qianyi_r', name: isZh ? '遷移' : isJa ? '遷移' : 'Travel', shortDesc: isZh ? '變動' : 'Travel', x: 75, y: 28, desc: t_palaces.qianyi, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'nu', name: isZh ? '奴僕' : isJa ? '奴僕' : 'Servant', shortDesc: isZh ? '晚輩' : 'Staff', x: 50, y: 78, desc: t_palaces.nupu, book: isZh ? '柳莊' : 'Liu Zhuang' },
      { id: 'bro_l', name: isZh ? '兄弟' : isJa ? '兄弟' : 'Bros', shortDesc: isZh ? '交友' : 'Peers', x: 30, y: 38, desc: t_palaces.xiongdi, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'bro_r', name: isZh ? '兄弟' : isJa ? '兄弟' : 'Bros', shortDesc: isZh ? '交友' : 'Peers', x: 70, y: 38, desc: t_palaces.xiongdi, book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'fu_l', name: isZh ? '福德' : isJa ? '福徳' : 'Fortune', shortDesc: isZh ? '福報' : 'Luck', x: 25, y: 30, desc: t_palaces.fude, book: isZh ? '冰鑑' : 'Ice Mirror' },
      { id: 'fu_r', name: isZh ? '福德' : isJa ? '福徳' : 'Fortune', shortDesc: isZh ? '福報' : 'Luck', x: 75, y: 30, desc: t_palaces.fude, book: isZh ? '冰鑑' : 'Ice Mirror' },
    ];
  } else {
    points = [
      { id: 'ear_l', name: isZh ? '童年運' : isJa ? '幼年運' : 'Childhood', shortDesc: '1-14', x: 8, y: 50, ageRange: '1-14', desc: isZh ? '看左耳。輪廓分明，童年健康好養。' : 'Left Ear. Childhood health.', book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'ear_r', name: isZh ? '童年運' : isJa ? '幼年運' : 'Childhood', shortDesc: '1-14', x: 92, y: 50, ageRange: '1-14', desc: isZh ? '看右耳。耳大有福，聰明伶俐。' : 'Right Ear. Intelligence.', book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'fore', name: isZh ? '少年運' : isJa ? '少年運' : 'Youth', shortDesc: '15-30', x: 50, y: 22, ageRange: '15-30', desc: isZh ? '看額頭。天庭飽滿，少年得志。' : 'Forehead. Academic success.', book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'brow', name: isZh ? '青年運' : isJa ? '青年運' : 'Young', shortDesc: '31-34', x: 50, y: 35, ageRange: '31-34', desc: isZh ? '看眉毛。眉清目秀，貴人多助。' : 'Brows. Social help.', book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'eye', name: isZh ? '青年運' : isJa ? '青年運' : 'Young', shortDesc: '35-40', x: 50, y: 44, ageRange: '35-40', desc: isZh ? '看眼睛。眼神含藏，事業衝刺期。' : 'Eyes. Career peak.', book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'nose', name: isZh ? '中年運' : isJa ? '中年運' : 'Middle', shortDesc: '41-50', x: 50, y: 58, ageRange: '41-50', desc: isZh ? '看鼻準。鼻挺顴豐，財富權力高峰。' : 'Nose. Wealth peak.', book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'mouth', name: isZh ? '晚年運' : isJa ? '晩年運' : 'Late', shortDesc: '51-60', x: 50, y: 78, ageRange: '51-60', desc: isZh ? '看嘴唇。稜角分明，食祿豐厚。' : 'Mouth. Luck in 50s.', book: isZh ? '麻衣' : 'Ma Yi' },
      { id: 'chin', name: isZh ? '晚年運' : isJa ? '晩年運' : 'Late', shortDesc: '61+', x: 50, y: 92, ageRange: '61+', desc: isZh ? '看下巴。圓厚有力，晚景優渥。' : 'Chin. Retirement luck.', book: isZh ? '麻衣' : 'Ma Yi' },
    ];
  }
  return points.map(p => ({
    ...p,
    x: 50 + (p.x - 50) * adj.scale + adj.x,
    y: 50 + (p.y - 50) * adj.scale + adj.y
  }));
};

const PrintStyles = () => (
  <style>{`
    @media print {
      @page { margin: 20mm; size: A4; }
      body { background-color: white !important; -webkit-print-color-adjust: exact; }
      body * { visibility: hidden; }
      #analysis-result, #analysis-result * { visibility: visible; }
      #analysis-result { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background-color: white !important; border: none !important; box-shadow: none !important; }
      #analysis-result h1, #analysis-result h2, #analysis-result h3, #analysis-result h4, #analysis-result p, #analysis-result div, #analysis-result span, #analysis-result li { color: #000000 !important; text-shadow: none !important; }
      #analysis-result { font-family: "Microsoft JhengHei", "PingFang TC", "Heiti TC", sans-serif !important; }
      .no-print { display: none !important; }
    }
  `}</style>
);

const ScanningOverlay = ({ mode }: { mode: AppMode }) => {
  const colorMap: Record<string, string> = {
    'aging': 'purple', 'career2027': 'cyan', 'daily': 'green', 'mirror': 'indigo', 'single': 'yellow', 'couple': 'pink', 'yearly': 'orange'
  };
  const color = colorMap[mode] || 'yellow';
  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-3xl">
      <style>{`@keyframes scan-move { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 110%; opacity: 0; } } .animate-scan { animation: scan-move 2.5s linear infinite; }`}</style>
      <div className={`absolute left-0 w-full h-2 bg-gradient-to-r from-transparent to-transparent shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-scan opacity-80 ${color === 'purple' ? 'via-purple-400 shadow-purple-500/50' : color === 'cyan' ? 'via-cyan-400 shadow-cyan-500/50' : color === 'green' ? 'via-green-400 shadow-green-500/50' : color === 'pink' ? 'via-pink-400 shadow-pink-500/50' : color === 'orange' ? 'via-orange-400 shadow-orange-500/50' : 'via-yellow-400 shadow-yellow-500/50'}`}></div>
    </div>
  );
};

const BookBadge: React.FC<{ title: string; titleEn: string; desc: string; icon: string; details: string, theme: Theme }> = ({ title, titleEn, desc, icon, details, theme }) => (
  <div className={`backdrop-blur-md border rounded-xl p-4 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-center min-h-[160px] relative overflow-hidden
    ${theme === 'dark' ? 'bg-indigo-900/40 border-indigo-400/30' : 'bg-white/60 border-indigo-200 shadow-sm'}
  `}>
    <div className="relative z-10">
      <div className="text-3xl mb-2 opacity-80 group-hover:scale-110 transition-transform">{icon}</div>
      <div className={`font-bold text-lg tracking-wider ${theme === 'dark' ? 'text-yellow-300' : 'text-indigo-700'}`}>{title}</div>
      <div className={`text-[10px] font-serif italic mb-2 uppercase ${theme === 'dark' ? 'text-yellow-100/60' : 'text-indigo-400'}`}>{titleEn}</div>
      <div className={`text-xs font-light tracking-wide border-t pt-2 ${theme === 'dark' ? 'text-indigo-200 border-indigo-500/30' : 'text-slate-600 border-indigo-200'}`}>{desc}</div>
      <div className={`hidden group-hover:block absolute inset-0 p-4 flex items-center justify-center text-xs leading-relaxed text-justify
         ${theme === 'dark' ? 'bg-indigo-950/95 text-yellow-50' : 'bg-white/95 text-indigo-900'}
      `}>
        {details}
      </div>
    </div>
  </div>
);

const EncyclopediaCard: React.FC<{ title: string; desc: string; icon: string, theme: Theme }> = ({ title, desc, icon, theme }) => (
  <div className={`border rounded-lg p-4 hover:transition-colors
    ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/60 border-indigo-100 hover:bg-white shadow-sm'}
  `}>
    <div className="flex items-center mb-2">
      <span className="text-2xl mr-3">{icon}</span>
      <h4 className={`font-bold text-sm sm:text-base ${theme === 'dark' ? 'text-yellow-300' : 'text-indigo-700'}`}>{title}</h4>
    </div>
    <p className={`text-xs sm:text-sm leading-relaxed opacity-90 ${theme === 'dark' ? 'text-indigo-100' : 'text-slate-600'}`}>{desc}</p>
  </div>
);

const HowItWorksSection: React.FC<{ t: Translation, theme: Theme }> = ({ t, theme }) => {
  const steps = [
    { icon: "👁️", data: t.howItWorks.steps.step1 },
    { icon: "📜", data: t.howItWorks.steps.step2 },
    { icon: "🧠", data: t.howItWorks.steps.step3 },
    { icon: "💌", data: t.howItWorks.steps.step4 },
  ];

  return (
    <div className="mb-20">
      <div className="text-center mb-10">
        <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.howItWorks.title}</h2>
        <p className={`${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600/80'}`}>{t.howItWorks.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className={`backdrop-blur-sm border rounded-2xl p-6 relative group transition-all
             ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-500/20 hover:bg-indigo-800/30' : 'bg-white/60 border-indigo-100 hover:bg-white shadow-md'}
          `}>
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-indigo-900 text-lg shadow-lg">
              {idx + 1}
            </div>
            <div className="text-4xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
            <h3 className={`text-lg font-bold text-center mb-3 ${theme === 'dark' ? 'text-yellow-300' : 'text-indigo-700'}`}>{step.data.title}</h3>
            <p className={`text-sm text-center leading-relaxed opacity-90 ${theme === 'dark' ? 'text-indigo-200' : 'text-slate-600'}`}>{step.data.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClassicDiagramSection: React.FC<{ t: Translation, theme: Theme }> = ({ t, theme }) => {
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
    <div className={`border-t pt-16 mb-16 ${theme === 'dark' ? 'border-white/10' : 'border-indigo-100'}`} id="classic-diagrams">
      <div className="text-center mb-10">
        <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.diagrams.title}</h2>
        <p className={`${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600/80'}`}>{t.diagrams.subtitle}</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {diagrams.map((d, idx) => (
          <div key={idx} className={`rounded-3xl p-6 border transition-all
             ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-500/20 hover:border-indigo-500/40' : 'bg-white/60 border-indigo-100 hover:shadow-lg'}
          `}>
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
               <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-indigo-950/50' : 'bg-indigo-50'}`}>
                 <h4 className={`font-bold mb-2 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-yellow-400' : 'text-indigo-700'}`}>Core Logic</h4>
                 <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-indigo-100' : 'text-slate-700'}`}>{d.data.core_logic}</p>
               </div>
               
               <div>
                 <h4 className="text-indigo-300 font-bold mb-3 text-xs uppercase tracking-wider">Key Interpretations</h4>
                 <ul className="space-y-3">
                   {d.data.points.map((pt, i) => (
                     <li key={i} className={`flex items-start text-sm leading-relaxed ${theme === 'dark' ? 'text-indigo-50/90' : 'text-slate-600'}`}>
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

const EncyclopediaSection: React.FC<{ t: Translation, theme: Theme }> = ({ t, theme }) => {
  const palaces = Object.entries(t.encyclopedia.palaces);
  return (
    <div className={`border-t pt-16 ${theme === 'dark' ? 'border-white/10' : 'border-indigo-100'}`}>
      <div className="text-center mb-12">
        <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.encyclopedia.title}</h2>
        <p className={`mb-8 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600/80'}`}>{t.encyclopedia.subtitle}</p>
        <div className={`inline-block rounded-full px-6 py-2 border text-sm font-semibold
           ${theme === 'dark' ? 'bg-indigo-900/30 border-indigo-500/30 text-yellow-300' : 'bg-indigo-100 border-indigo-200 text-indigo-700'}
        `}>{t.encyclopedia.palaces_title}</div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
          <EncyclopediaCard title={t.encyclopedia.wuyue.title} desc={t.encyclopedia.wuyue.desc} icon="⛰️" theme={theme} />
          <EncyclopediaCard title={t.encyclopedia.sidu.title} desc={t.encyclopedia.sidu.desc} icon="🌊" theme={theme} />
          <EncyclopediaCard title={t.encyclopedia.wuxing.title} desc={t.encyclopedia.wuxing.desc} icon="✨" theme={theme} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {palaces.map(([key, desc], idx) => (
          <div key={key} className={`border rounded-xl p-5 transition-all hover:-translate-y-1
             ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-indigo-100 hover:shadow-md'}
          `}>
            <div className="flex items-start">
              <span className={`text-4xl font-serif mr-3 -mt-1 ${theme === 'dark' ? 'text-yellow-500/50' : 'text-indigo-200'}`}>{idx + 1}</span>
              <p className={`text-sm leading-relaxed text-justify ${theme === 'dark' ? 'text-indigo-100' : 'text-slate-600'}`}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MirrorModeExplanation: React.FC<{ t: Translation, theme: Theme }> = ({ t, theme }) => {
  return (
    <div className="mt-10 mb-16 animate-fadeIn">
      <div className={`border rounded-3xl p-6 md:p-10
         ${theme === 'dark' ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-white/60 border-indigo-100 shadow-sm'}
      `}>
        <div className="text-center mb-10">
          <div className={`inline-block px-4 py-1 mb-4 rounded-full border text-xs tracking-widest uppercase
             ${theme === 'dark' ? 'bg-indigo-600/30 border-indigo-400/30 text-indigo-200' : 'bg-indigo-100 border-indigo-200 text-indigo-600'}
          `}>DEEP DIVE</div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.mirror.concept_title}</h2>
          <p className={`max-w-3xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-indigo-200' : 'text-slate-600'}`}>{t.mirror.concept_desc}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className={`rounded-2xl p-6 border transition-colors flex flex-col items-center text-center
             ${theme === 'dark' ? 'bg-indigo-900/30 border-indigo-500/20 hover:bg-indigo-900/50' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'}
          `}>
            <div className="text-5xl mb-4">🧠</div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-indigo-700'}`}>{t.mirror.left_face_title}</h3>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-indigo-100' : 'text-slate-600'}`}>{t.mirror.left_face_desc}</p>
          </div>
          <div className={`rounded-2xl p-6 border transition-colors flex flex-col items-center text-center
             ${theme === 'dark' ? 'bg-purple-900/30 border-purple-500/20 hover:bg-purple-900/50' : 'bg-purple-50 border-purple-100 hover:bg-purple-100'}
          `}>
            <div className="text-5xl mb-4">🎭</div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{t.mirror.right_face_title}</h3>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-indigo-100' : 'text-slate-600'}`}>{t.mirror.right_face_desc}</p>
          </div>
        </div>
        <div className={`rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6
           ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}
        `}>
           <div className="flex-shrink-0 bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30">⚡</div>
           <div className="text-center md:text-left">
             <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.mirror.visual_shock_title}</h3>
             <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-indigo-200' : 'text-slate-600'}`}>{t.mirror.visual_shock_desc}</p>
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
  const STANDARD_FACE_URL = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80";

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
          {/* User Image */}
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

          {/* Ghost Overlay (Standard Face) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 mix-blend-screen">
             <img src={STANDARD_FACE_URL} className="w-full h-full object-cover opacity-50" alt="Reference" />
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
             <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all">{t.mirror.cancel_align}</button>
             <button onClick={confirm} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg transition-all">{t.mirror.confirm_align}</button>
          </div>
        </div>
        
        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  t: Translation;
  theme: Theme;
}> = ({ isOpen, onClose, onSuccess, t, theme }) => {
  const [mode, setMode] = useState<'buy' | 'redeem'>('buy');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const DEV_KEYS = ["6F0E4C97-B72A4E69-A11BF6C4-AF6517E7", "PRO2026", "DEVTEST"];

  useEffect(() => { if(isOpen) { setMode('buy'); setKey(''); setIsSuccess(false); } }, [isOpen]);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanKey = key.trim().toUpperCase();
    const gumroadKeyPattern = /^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/;
    setTimeout(() => {
       if(gumroadKeyPattern.test(cleanKey) || DEV_KEYS.includes(cleanKey)) { 
           setLoading(false); setIsSuccess(true);
           setTimeout(() => { onSuccess(); onClose(); }, 1500);
       } else { setLoading(false); alert("無效的序號格式 (Invalid Key Format)"); }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100 ${theme === 'dark' ? 'bg-slate-900 border border-indigo-500/50' : 'bg-white border border-indigo-100'}`}>
        <div className={`p-6 text-center relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
           <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">✕</button>
           <div className="text-4xl mb-2">💎</div>
           <h3 className="text-2xl font-bold text-white mb-1">{t.payment.modal_title}</h3>
           <p className="text-white/80 text-sm">{t.payment.modal_desc}</p>
        </div>
        <div className="p-6">
           {isSuccess ? (
             <div className="text-center py-10 animate-bounce-in"><div className="text-6xl mb-4">🎉</div><h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.payment.success}</h3></div>
           ) : (
             <div className="space-y-6">
                <div className={`text-sm space-y-2 p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                   <div className={theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}>✅ {t.payment.feature_1}</div>
                   <div className={theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}>✅ {t.payment.feature_2}</div>
                   <div className={theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}>✅ {t.payment.feature_3}</div>
                </div>
                <div className="flex rounded-lg bg-gray-200/20 p-1">
                    <button onClick={() => setMode('buy')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'buy' ? 'bg-white text-indigo-900 shadow' : 'text-gray-400'}`}>{t.payment.buy_btn}</button>
                    <button onClick={() => setMode('redeem')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'redeem' ? 'bg-white text-indigo-900 shadow' : 'text-gray-400'}`}>{t.payment.redeem_btn}</button>
                </div>
                {mode === 'buy' ? (
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-500 mb-4">{t.payment.plan_price}</p>
                        <a href={t.payment.gumroad_url} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all text-center">{t.payment.buy_btn}</a>
                        <p className="text-xs mt-2 opacity-60">Secure payment via Gumroad</p>
                    </div>
                ) : (
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder={t.payment.redeem_placeholder} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-center uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                        <p className="text-xs text-center opacity-60">{t.payment.redeem_hint}</p>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-70">{loading ? "Verifying..." : t.payment.verify_btn}</button>
                    </form>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const YearlyFortuneSection: React.FC<{
  imageData: string;
  onAnalyze: (dob: string, time: string) => void;
  t: Translation;
  theme: Theme;
}> = ({ imageData, onAnalyze, t, theme }) => {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');

  return (
    <div className={`animate-fadeIn border rounded-3xl p-6 md:p-8 mt-4 ${theme === 'dark' ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-white/60 border-indigo-200 shadow-md'}`}>
       <div className="text-center mb-8"><h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.yearly.title}</h2><p className={`text-sm ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>{t.yearly.subtitle}</p></div>
       <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`p-5 rounded-2xl border relative overflow-hidden group ${theme === 'dark' ? 'bg-indigo-900/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
             <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">☯️</div>
             <h3 className={`text-lg font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-yellow-300' : 'text-indigo-700'}`}><span className="text-xl mr-2">📅</span> {t.yearly.method1_title}</h3>
             <p className={`text-sm leading-relaxed opacity-90 ${theme === 'dark' ? 'text-indigo-200' : 'text-slate-600'}`}>{t.yearly.method1_desc}</p>
          </div>
          <div className={`p-5 rounded-2xl border relative overflow-hidden group ${theme === 'dark' ? 'bg-indigo-900/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
             <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">✨</div>
             <h3 className={`text-lg font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}><span className="text-xl mr-2">🌌</span> {t.yearly.method2_title}</h3>
             <p className={`text-sm leading-relaxed opacity-90 ${theme === 'dark' ? 'text-indigo-200' : 'text-slate-600'}`}>{t.yearly.method2_desc}</p>
          </div>
       </div>
       <div className={`max-w-sm mx-auto p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-indigo-100 shadow-sm'}`}>
          <div className="mb-4"><label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>{t.yearly.dob_label}</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={`w-full border rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 appearance-none ${theme === 'dark' ? 'bg-indigo-950 text-white border-indigo-500/50 focus:ring-yellow-500' : 'bg-slate-50 text-slate-900 border-indigo-200 focus:ring-indigo-400'}`} style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} /></div>
          <div className="mb-6"><label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>{t.yearly.tob_label}</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`w-full border rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 appearance-none ${theme === 'dark' ? 'bg-indigo-950 text-white border-indigo-500/50 focus:ring-purple-500' : 'bg-slate-50 text-slate-900 border-indigo-200 focus:ring-purple-400'}`} style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} /></div>
          <button onClick={() => dob && onAnalyze(dob, time || "12:00")} disabled={!dob} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95">{t.yearly.analyze_btn}</button>
       </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. MAIN APPLICATION COMPONENT
// -----------------------------------------------------------------------------

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('single');
  const [imageData, setImageData] = useState<string | null>(null);
  const [coupleData, setCoupleData] = useState<{ p1: string | null; p2: string | null }>({ p1: null, p2: null });
  const [agingPath, setAgingPath] = useState<'virtue' | 'worry' | null>(null);
  const [mirrorImages, setMirrorImages] = useState<{ inner: string; outer: string } | null>(null);
  const [isAligning, setIsAligning] = useState(false);
  const [userDob, setUserDob] = useState<string>('');
  const [userTime, setUserTime] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isPremium, setIsPremium] = useState(false); 
  const [showPayModal, setShowPayModal] = useState(false); 
  const [mapAdjustment, setMapAdjustment] = useState({ x: 0, y: 0, scale: 1 });
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<Language>('zh-TW');
  const [showFaceMap, setShowFaceMap] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<MapMode>('palaces');
  const [selectedPoint, setSelectedPoint] = useState<FacePoint | null>(null);

  const t = TRANSLATIONS[language];
  const facePoints = getFacePoints(language, mapMode, mapAdjustment);
  const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";


  // Handlers... 
  
  const handleDownloadPDF = () => {
    window.print();
  };

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
            const w = img.width; const h = img.height; const halfW = Math.floor(w / 2);
            canvas.width = w; canvas.height = h;
            ctx.clearRect(0, 0, w, h); ctx.drawImage(img, halfW, 0, halfW, h, halfW, 0, halfW, h); ctx.save(); ctx.scale(-1, 1); ctx.drawImage(img, halfW, 0, halfW, h, -halfW, 0, halfW, h); ctx.restore();
            const innerBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            ctx.clearRect(0, 0, w, h); ctx.drawImage(img, 0, 0, halfW, h, 0, 0, halfW, h); ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, halfW, h, 0, 0, halfW, h); ctx.restore();
            const outerBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            resolve({ inner: innerBase64, outer: outerBase64 });
        };
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
    if (file) { try { const base64Data = await fileToBase64(file); setCoupleData(prev => ({ ...prev, [partner]: base64Data })); setError(''); setAnalysisResult(''); } catch { setError(t.upload.error_read); } }
    event.target.value = '';
  };

  const checkPremium = () => { if (!isPremium) { setShowPayModal(true); return false; } return true; };

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

  const handleYearlyFortune = async (dob: string, time: string) => {
      setUserDob(dob); setUserTime(time); setIsLoading(true); setError(''); setAnalysisResult('');
      if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
      const systemPrompt = `你是一位精通 **《麻衣相法》流年部位**、**八字命理** 與 **紫微斗數** 的命理大師。
      請結合用戶的「面相照片」與「出生資料」(${dob} ${time})，預測 2027 (丙午馬年) 與 2028 (戊申猴年) 的詳細運勢。
      **分析方法 (三元合參)**：
      1. **面相流年法**：精確找出未來兩歲對應的臉部「流年部位」，分析氣色形態。
      2. **八字命理法**：根據 ${dob} ${time} 排出四柱，分析日主強弱、五行喜忌，以及流年太歲的沖合關係。
      3. **紫微斗數法**：根據出生時辰推算命宮主星與流年四化（祿權科忌），判斷具體際遇。
      
      **輸出結構 (社群風格)**：
      1. **🗓️ 您的流年座標**：指出目前虛歲與對應的面相部位。
      2. **📜 八字紫微總論**：簡述格局與流年星象。
      3. **🔮 2027年 (丙午馬年) 預測**：
         - **面相視角**：...
         - **八字/紫微視角**：...
         - **白話建議**：工作/感情/財運。
      4. **🔮 2028年 (戊申猴年) 預測**：同上。
      5. **💡 開運錦囊**：綜合建議。
      
      語氣：專業、精準、正向賦能。語言：${t.ai_prompt_lang}。請勿使用Markdown符號。`;
      const userQuery = `Analyze yearly fortune for DOB: ${dob} ${time}. Language: ${t.ai_prompt_lang}. No Markdown.`;
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

  // Auto-translate (Re-analyze) when language changes
  useEffect(() => {
    if (!analysisResult || isLoading) return;

    const reAnalyze = async () => {
        if (appMode === 'aging' && agingPath) {
            await handleAgingSimulation(agingPath);
        } else if (appMode === 'yearly' && userDob) {
            await handleYearlyFortune(userDob, userTime);
        } else {
            if (appMode === 'single' && !imageData) return;
            if (appMode === 'couple' && (!coupleData.p1 || !coupleData.p2)) return;
            if (appMode === 'mirror' && !mirrorImages) return;
            await analyze();
        }
    };
    reAnalyze();
  }, [language]);

  const analyze = async () => {
    if (appMode === 'mirror' && !checkPremium()) return;
    setIsLoading(true); setError('');
    setTimeout(() => document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    
    let systemPrompt = ""; 
    let userQuery = ""; 
    let parts: any[] = [];

    const bookDefinitions = `
    參考典籍與分析重點：
    1. 《麻衣相法》：以「五官、十二宮、十三部位、流年運勢」為骨架，分析基礎命理架構。
    2. 《柳莊相法》：注重「氣色觀人」與「動態神情」，強調「面相會變」，分析當下吉凶與變數。
    3. 《水鏡相法》：重在分辨「忠奸賢愚」，分析性格本質與實用性的人際互動。
    4. 《冰鑑》：從「神、骨、氣、色、音、態」整體觀人，分析內在精神格局與潛力。
    `;

    if (appMode === 'career2027') { // Updated Logic for 2027
        if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
        
        systemPrompt = `你是一位 **賽博玄學職涯顧問 (Cyber-Metaphysicist)**。
        任務：結合 **古老面相學** 與 **2027 丁未年 (Fire Sheep)** 的流年天干地支氣場，分析用戶的「2027 職涯規劃」。

        **2027 丁未年 (丁火/未土) 趨勢**：
        - **丁火 (天干)**：象徵靈感、科技軟體、美學、星光。趨勢走向「內容」、「精神價值」。
        - **未土 (地支)**：木庫，藏乙木、丁火、己土。象徵收斂、醞釀、藝術、土地、養生。
        - **關鍵字**：由虛入實、重質不重量、跨界整合。

        **分析重點**：
        1. **轉職時機 (Job Change Timing)**：
           - **上半年 (木火旺)**：適合創新、發布新作品、建立個人品牌。
           - **下半年 (土金氣)**：適合落地執行、資產配置、穩固根基。
           - **建議**：根據面相氣色（如印堂亮度、眼神定力）判斷適合在上半年衝刺還是下半年轉職。
        2. **貴人運勢 (Noblemen Luck)**：
           - **面相特徵**：觀察眉毛（兄弟宮）與額角（遷移宮）。
           - **貴人方位/屬相**：結合丁未年特性，指出貴人可能出現的方位（如南方）或生肖（如馬、兔、豬）。

        **輸出格式 (社群風格)**：
        1. **🔮 2027 天命職業**：(具體職稱)。
        2. **📅 轉職黃金窗口**：分析上半年 vs 下半年，何時最適合變動，並說明原因。
        3. **🤝 貴人雷達**：預測貴人特徵與出現時機。
        4. **🚀 啟動建議**：現在開始該準備什麼。

        語氣：前衛、神秘、專業。語言：${t.ai_prompt_lang}。請勿使用Markdown符號。`;

        userQuery = `Predict 2027 career, job change timing, and noblemen luck based on face. Language: ${t.ai_prompt_lang}. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: imageData } }];
    
    } else if (appMode === 'single') {
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
    } else if (appMode === 'career2027') {
        if (!imageData) { setError(t.upload.error_empty); setIsLoading(false); return; }
        systemPrompt = `你是一位 **賽博玄學職涯顧問 (Cyber-Metaphysicist)**...`;
        userQuery = `Predict 2027 career. Language: ${t.ai_prompt_lang}. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: imageData } }];
    } else if (appMode === 'mirror') {
        if (!mirrorImages) { setError("Processing mirror images..."); setIsLoading(false); return; }
        systemPrompt = `你是一位精通心理學與面相學的 **靈魂分析師**...`;
        userQuery = `Analyze contrast. Language: ${t.ai_prompt_lang}. No Markdown.`;
        parts = [{ text: userQuery }, { inlineData: { mimeType: "image/jpeg", data: mirrorImages.inner } }, { inlineData: { mimeType: "image/jpeg", data: mirrorImages.outer } }];
    }
    
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
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-indigo-50' : 'bg-slate-50 text-slate-800'}`}>
      <PrintStyles />
      <PaymentModal isOpen={showPayModal} onClose={() => setShowPayModal(false)} onSuccess={() => setIsPremium(true)} t={t} theme={theme} />

      {/* ... Background ... */}

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-6">
        {/* ... Top Bar & Header ... */}
        <div className="flex justify-end mb-6 gap-3">
           {isPremium && <span className="px-3 py-1 bg-yellow-400 text-indigo-900 rounded-full text-xs font-bold flex items-center shadow-lg">👑 PRO</span>}
           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-full transition-all duration-300 border ${theme === 'dark' ? 'bg-white/10 border-white/10 hover:bg-white/20 text-yellow-300' : 'bg-white/80 border-indigo-200 hover:bg-white text-indigo-600 shadow-sm'}`}>{theme === 'dark' ? '☀️' : '🌙'}</button>
           <div className={`backdrop-blur-md rounded-full p-1 flex space-x-1 border ${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white/80 border-indigo-200 shadow-sm'}`}>
              {(['zh-TW', 'en', 'ja'] as Language[]).map(l => (
                  <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-1 rounded-full text-xs transition-all ${language === l ? (theme === 'dark' ? 'bg-yellow-400 text-indigo-950 font-bold' : 'bg-indigo-600 text-white font-bold shadow-sm') : (theme === 'dark' ? 'text-indigo-300 hover:text-white' : 'text-indigo-400 hover:text-indigo-800')}`}>{l === 'zh-TW' ? '中' : l === 'en' ? 'EN' : '日'}</button>
              ))}
           </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-block px-3 py-1 mb-4 border rounded-full text-xs tracking-widest uppercase ${theme === 'dark' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300' : 'border-indigo-200 bg-indigo-50 text-indigo-600'}`}>{t.subtitle}</div>
          <h1 className={`text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r mb-6 drop-shadow-sm ${theme === 'dark' ? 'from-yellow-200 via-white to-yellow-100' : 'from-indigo-600 via-purple-600 to-indigo-800'}`}>{t.title}</h1>
          <div className="flex justify-center mb-8">
             <div className="flex flex-wrap justify-center gap-3">
                {(['single', 'couple', 'daily', 'aging', 'career2027', 'mirror', 'yearly'] as AppMode[]).map(mode => (
                    <button key={mode} onClick={() => { setAppMode(mode); setAnalysisResult(''); setError(''); }} 
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${appMode === mode ? (theme === 'dark' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] ring-2 ring-indigo-400/50' : 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200') : (theme === 'dark' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/60 hover:text-white' : 'bg-white border border-indigo-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700')}`}>
                       <span>{{single: '👤', couple: '❤️', daily: '☀️', aging: '⏳', career2027: '🚀', mirror: '🎭', yearly: '📅'}[mode]}</span> {t.tabs[mode]}
                    </button>
                ))}
             </div>
          </div>
        </div>

        {/* ... Main Content ... */}
        
        {isAligning && imageData && <ImageAligner imageData={imageData} onConfirm={handleAlignmentConfirm} onCancel={handleAlignmentCancel} t={t} />}

        {/* Books Grid */}
        {appMode === 'single' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <BookBadge theme={theme} title={t.books.mayi.title} titleEn="Ma Yi" desc={t.books.mayi.desc} icon="📜" details={t.books.mayi.details} />
                <BookBadge theme={theme} title={t.books.liuzhuang.title} titleEn="Liu Zhuang" desc={t.books.liuzhuang.desc} icon="👀" details={t.books.liuzhuang.details} />
                <BookBadge theme={theme} title={t.books.shuijing.title} titleEn="Water Mirror" desc={t.books.shuijing.desc} icon="⚖️" details={t.books.shuijing.details} />
                <BookBadge theme={theme} title={t.books.bingjian.title} titleEn="Ice Mirror" desc={t.books.bingjian.desc} icon="🧊" details={t.books.bingjian.details} />
            </div>
        )}

        {/* Main Content Grid */}
        <div className={`transition-all duration-500 ease-in-out ${(!imageData && appMode !== 'couple') || appMode === 'yearly' ? 'flex justify-center' : 'grid md:grid-cols-2 gap-8'} mb-16 animate-fadeIn`}>
            {/* Left Column */}
            <div className={`flex flex-col space-y-6 ${(!imageData && appMode !== 'couple') || appMode === 'yearly' ? 'w-full max-w-xl' : 'w-full'}`}>
                 {/* ... (Couple / Single Upload Logic from previous) ... */}
                 {appMode === 'couple' ? (
                     <div className="grid grid-cols-2 gap-4">
                        <div className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden group ${theme === 'dark' ? 'bg-indigo-900/30 border-indigo-500/30 hover:bg-indigo-800/30' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'}`}>
                            <input type="file" id="p1File" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleCoupleFileChange(e, 'p1')} />
                            <input type="file" id="p1Cam" className="hidden" accept="image/jpeg, image/png, image/webp" capture="user" onChange={(e) => handleCoupleFileChange(e, 'p1')} />
                            {coupleData.p1 ? (
                                <><img src={`data:image/jpeg;base64,${coupleData.p1}`} className="w-full h-full object-cover" alt="P1" /><button onClick={() => setCoupleData(prev => ({...prev, p1: null}))} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">×</button></>
                            ) : (
                                <div className="text-center p-4"><div className="text-4xl mb-2">👦</div><button onClick={() => document.getElementById('p1Cam')?.click()} className="px-3 py-1.5 bg-indigo-600 rounded-full text-xs text-white mb-2">📷 {t.upload.camera}</button><button onClick={() => document.getElementById('p1File')?.click()} className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white">📂 {t.upload.file}</button></div>
                            )}
                        </div>
                        <div className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden group ${theme === 'dark' ? 'bg-pink-900/20 border-pink-500/30 hover:bg-pink-800/20' : 'bg-pink-50 border-pink-200 hover:bg-pink-100'}`}>
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
                     <div className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all hover:border-opacity-100 border-opacity-60 relative shadow-xl ${appMode === 'career2027' ? 'border-cyan-500' : 'border-indigo-500'} ${theme === 'dark' ? 'hover:bg-white/5' : 'bg-white hover:bg-indigo-50'}`}>
                        <input type="file" id="singleFileInput" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleSingleFileChange} />
                        <input type="file" id="singleCameraInput" className="hidden" accept="image/jpeg, image/png, image/webp" capture="user" onChange={handleSingleFileChange} />
                        <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner animate-pulse">{appMode === 'daily' ? '🌞' : appMode === 'aging' ? '⏳' : appMode === 'career2027' ? '🚀' : appMode === 'yearly' ? '📅' : '📸'}</div>
                        <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{appMode === 'daily' ? t.daily.title : appMode === 'aging' ? t.aging.title : appMode === 'career2027' ? t.career2027.title : appMode === 'yearly' ? t.yearly.title : t.upload.title}</h3>
                        <p className={`text-sm mb-8 leading-relaxed ${theme === 'dark' ? 'text-indigo-300' : 'text-slate-500'}`}>{appMode === 'aging' ? t.aging.subtitle : appMode === 'career2027' ? t.career2027.subtitle : appMode === 'yearly' ? t.yearly.subtitle : t.upload.hint}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => document.getElementById('singleCameraInput')?.click()} className={`px-8 py-4 rounded-full font-bold text-white shadow-lg transition-transform transform hover:-translate-y-1 active:scale-95 flex items-center ${appMode === 'career2027' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'}`}><span className="mr-2 text-xl">📷</span> {t.upload.camera}</button>
                            <button onClick={() => document.getElementById('singleFileInput')?.click()} className={`px-8 py-4 border rounded-full font-bold transition-transform transform hover:-translate-y-1 active:scale-95 flex items-center ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'}`}><span className="mr-2 text-xl">📂</span> {t.upload.file}</button>
                        </div>
                        <div className="mt-6 text-center"><button onClick={() => { fetch('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80').then(r => r.blob()).then(blob => handleSingleFileProcess(new File([blob], "demo.jpg", { type: "image/jpeg" }))); }} className={`text-xs underline ${theme === 'dark' ? 'text-indigo-400 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}>{t.upload.demo}</button></div>
                        <div className={`mt-8 flex items-center justify-center text-[10px] px-4 py-2 rounded-full border ${theme === 'dark' ? 'text-indigo-400 bg-indigo-900/30 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 border-indigo-200'}`}><span className="mr-2 text-lg">🛡️</span> {t.upload.privacy}</div>
                     </div>
                 ) : (
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
                 {imageData && appMode === 'single' && (
                    <div className="flex flex-col gap-2">
                        <div className={`rounded-2xl p-1 flex relative ${theme === 'dark' ? 'bg-white/5' : 'bg-indigo-100'}`}>
                            <div className={`absolute top-1 bottom-1 w-1/2 rounded-xl transition-all duration-300 ${mapMode === 'palaces' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-1'} ${theme === 'dark' ? 'bg-indigo-600' : 'bg-white shadow-md'}`}></div>
                            <button onClick={() => { setMapMode('palaces'); setSelectedPoint(null); }} className={`relative z-10 w-1/2 py-2 text-sm font-medium text-center ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.map.mode_palace}</button>
                            <button onClick={() => { setMapMode('ages'); setSelectedPoint(null); }} className={`relative z-10 w-1/2 py-2 text-sm font-medium text-center ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>{t.map.mode_age}</button>
                        </div>
                        
                        {/* Always visible calibration controls */}
                        <div className={`p-4 rounded-2xl border animate-fadeIn ${theme === 'dark' ? 'bg-indigo-900/50 border-yellow-500/30' : 'bg-white/80 border-indigo-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-indigo-700'}`}>{t.map.calibrate_title}</span>
                                <button onClick={() => setMapAdjustment({x:0, y:0, scale:1})} className={`text-[10px] px-2 py-0.5 rounded ${theme === 'dark' ? 'text-indigo-300 bg-white/10' : 'text-slate-500 bg-slate-100'}`}>{t.map.reset_btn}</button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2"><span className={`text-xs w-8 ${theme === 'dark' ? 'text-indigo-300' : 'text-slate-600'}`}>Y</span><input type="range" min="-30" max="30" value={mapAdjustment.y} onChange={e => setMapAdjustment({...mapAdjustment, y: Number(e.target.value)})} className="flex-1 h-1 bg-indigo-200/50 rounded-lg appearance-none cursor-pointer accent-indigo-500" /></div>
                                <div className="flex items-center gap-2"><span className={`text-xs w-8 ${theme === 'dark' ? 'text-indigo-300' : 'text-slate-600'}`}>X</span><input type="range" min="-20" max="20" value={mapAdjustment.x} onChange={e => setMapAdjustment({...mapAdjustment, x: Number(e.target.value)})} className="flex-1 h-1 bg-indigo-200/50 rounded-lg appearance-none cursor-pointer accent-indigo-500" /></div>
                                <div className="flex items-center gap-2"><span className={`text-xs w-8 ${theme === 'dark' ? 'text-indigo-300' : 'text-slate-600'}`}>Size</span><input type="range" min="0.8" max="1.2" step="0.05" value={mapAdjustment.scale} onChange={e => setMapAdjustment({...mapAdjustment, scale: Number(e.target.value)})} className="flex-1 h-1 bg-indigo-200/50 rounded-lg appearance-none cursor-pointer accent-indigo-500" /></div>
                            </div>
                        </div>
                    </div>
                 )}

                 {appMode === 'yearly' && imageData && (
                     <YearlyFortuneSection imageData={imageData} onAnalyze={handleYearlyFortune} t={t} theme={theme} />
                 )}

                 {/* The Analyze Button */}
                 {!analysisResult && appMode !== 'aging' && appMode !== 'yearly' && imageData && (
                    <button onClick={analyze} disabled={isLoading || (appMode === 'couple' && (!coupleData.p1 || !coupleData.p2))} 
                        className={`w-full py-4 font-bold text-lg rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                        ${appMode === 'daily' ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' 
                        : appMode === 'career2027' ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white' 
                        : appMode === 'mirror' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-indigo-950'}`}>
                        {isLoading ? t.analysis.btn_loading : (
                           <div className="flex items-center justify-center gap-2">
                             {(appMode === 'mirror' && !isPremium) && <span>🔒</span>}
                             {appMode === 'couple' ? `💞 ${t.couple.analyze_btn}` : appMode === 'mirror' ? `🔮 ${t.mirror.analyze_btn}` : t.analysis.btn_start}
                           </div>
                        )}
                    </button>
                 )}
            </div>
            
            {/* Right Column: Results */}
             <div className="flex flex-col space-y-6">
                {/* ... Mirror/Aging Displays ... */}
                {appMode === 'mirror' && mirrorImages && (
                     <div className="grid md:grid-cols-2 gap-4">
                         <div className={`rounded-xl p-2 text-center ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                             <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>{t.mirror.inner_label}</div>
                             <img src={`data:image/jpeg;base64,${mirrorImages.inner}`} className="w-full rounded-lg" />
                         </div>
                         <div className={`rounded-xl p-2 text-center ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                             <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>{t.mirror.outer_label}</div>
                             <img src={`data:image/jpeg;base64,${mirrorImages.outer}`} className="w-full rounded-lg" />
                         </div>
                     </div>
                )}

                {appMode === 'aging' && imageData && (
                    <div className={`border rounded-3xl p-6 mb-2 ${theme === 'dark' ? 'bg-indigo-950/30 border-white/10' : 'bg-white/60 border-indigo-100'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleAgingSimulation('virtue')} className={`p-4 rounded-xl border-2 transition-all ${agingPath === 'virtue' ? 'bg-indigo-600 border-yellow-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}><div className="text-3xl mb-2">🧘</div><div className="font-bold text-sm">{t.aging.path_virtue}</div></button>
                            <button onClick={() => handleAgingSimulation('worry')} className={`p-4 rounded-xl border-2 transition-all ${agingPath === 'worry' ? 'bg-indigo-600 border-yellow-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}><div className="text-3xl mb-2">😫</div><div className="font-bold text-sm">{t.aging.path_worry}</div></button>
                        </div>
                    </div>
                )}

                {appMode === 'single' && imageData && (
                    <div className={`border rounded-3xl p-6 min-h-[150px] flex flex-col justify-center relative overflow-hidden transition-all ${theme === 'dark' ? 'bg-indigo-950/50 border-indigo-500/30' : 'bg-white/60 border-indigo-100'}`}>
                        {selectedPoint ? (
                            <div className="animate-fadeIn">
                                <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-indigo-700'}`}>{selectedPoint.name}</h3>
                                <p className={`font-light ${theme === 'dark' ? 'text-indigo-100' : 'text-slate-600'}`}>{selectedPoint.desc}</p>
                            </div>
                        ) : (
                            <div className={`text-center ${theme === 'dark' ? 'text-indigo-400/60' : 'text-slate-400'}`}><div className="text-4xl mb-2">👆</div><p>{t.map.select_prompt}</p></div>
                        )}
                    </div>
                )}
                
                {analysisResult && (
                    <div id="analysis-result" className={`p-6 rounded-3xl shadow-xl animate-fadeIn border-t-8 relative overflow-hidden 
                       ${appMode === 'daily' ? 'border-green-500' : appMode === 'yearly' ? 'border-orange-500' : 'border-yellow-500'}
                       ${theme === 'dark' ? 'bg-white/90 text-indigo-950' : 'bg-white text-slate-900 shadow-2xl'}
                       ${(!isPremium && ['career2027', 'mirror', 'yearly', 'aging'].includes(appMode)) ? 'max-h-[500px] overflow-hidden pb-0' : ''} 
                    `}>
                         <div className="hidden print:block text-center mb-6 border-b pb-4">
                            <h1 className="text-3xl font-bold">AI Face Reading Report</h1>
                            <p className="text-sm text-gray-500">Generated by AI Physiognomy Master</p>
                         </div>

                         <div className="prose prose-indigo max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap">{analysisResult}</div>

                         {/* Locked Mask for Paid Features Only (Career2027, Mirror, Yearly, Aging) */}
                         {!isPremium && ['career2027', 'mirror', 'yearly', 'aging'].includes(appMode) && (
                            <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-8 z-20 no-print">
                               <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-indigo-100 shadow-2xl flex flex-col items-center text-center max-w-xs mx-4">
                                  <div className="text-4xl mb-2">🔒</div>
                                  <h4 className="font-bold text-lg text-indigo-900 mb-1">解鎖完整分析</h4>
                                  <p className="text-xs text-indigo-600 mb-4">{t.payment.locked_content}</p>
                                  <button onClick={() => setShowPayModal(true)} className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-indigo-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform animate-pulse">
                                     {t.payment.unlock_btn}
                                  </button>
                               </div>
                            </div>
                         )}
                         
                         {/* Footer & Download (Show if unlocked or free mode) */}
                         {(isPremium || !['career2027', 'mirror', 'yearly', 'aging'].includes(appMode)) && (
                            <>
                                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                                     {t.analysis.disclaimer}
                                     <br className="hidden print:block" />
                                     <span className="hidden print:inline"> Visit us for more insights.</span>
                                 </div>

                                 <button 
                                   onClick={handleDownloadPDF}
                                   className="no-print absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 hover:text-indigo-600 transition-colors shadow-sm"
                                   title={t.analysis.download_btn}
                                 >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                 </button>
                            </>
                         )}
                    </div>
                )}

                {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm text-center">{error}</div>}
             </div>
        </div>

        {/* Shared Footer Sections */}
        {appMode === 'single' && <HowItWorksSection t={t} theme={theme} />}
        {appMode === 'single' && <ClassicDiagramSection t={t} theme={theme} />}
        {appMode === 'single' && <EncyclopediaSection t={t} theme={theme} />}
        {appMode === 'mirror' && <MirrorModeExplanation t={t} theme={theme} />}

      </div>
    </div>
  );
};

export default App;