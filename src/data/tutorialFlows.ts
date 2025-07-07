import { TutorialFlow } from "@/types/tutorial";

export const tutorialFlows: TutorialFlow[] = [
  {
    id: "basic-intro",
    name: "기본 게임 방법",
    description: "QuickTap Arena의 기본적인 게임 방법을 배워보세요",
    steps: [
      {
        id: "welcome",
        title: "QuickTap Arena에 오신 것을 환영합니다! 🎮",
        content: "반응속도 테스트 게임에 오신 것을 환영합니다! 간단한 튜토리얼로 게임 방법을 배워보세요.",
        position: "center",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "game-modes",
        title: "게임 모드 선택",
        content: "다양한 게임 모드가 있어요. 먼저 '일반 모드'를 클릭해보세요.",
        target: "[aria-label='일반 모드 시작']",
        position: "bottom",
        action: "click",
        skippable: false,
        nextEnabled: false
      },
      {
        id: "countdown",
        title: "카운트다운",
        content: "게임이 시작되기 전 3초 카운트다운이 있습니다. 준비하세요!",
        position: "center",
        action: "wait",
        duration: 4000,
        skippable: false,
        nextEnabled: true
      },
      {
        id: "ready-state",
        title: "준비 완료!",
        content: "화면이 빨간색에서 초록색으로 바뀌면 즉시 클릭하거나 스페이스바를 누르세요!",
        position: "center",
        action: "wait",
        duration: 2000,
        skippable: false,
        nextEnabled: true
      },
      {
        id: "timing",
        title: "⏰ 타이밍이 중요해요",
        content: "너무 빨리 클릭하면 '너무 빨라요!' 메시지가 나타납니다. 초록색이 된 후에 클릭하세요.",
        position: "center",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "result",
        title: "결과 확인",
        content: "게임이 끝나면 반응속도가 밀리초(ms) 단위로 표시됩니다. 더 낮을수록 좋아요!",
        position: "center",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "complete",
        title: "튜토리얼 완료! 🎉",
        content: "이제 모든 게임 모드를 자유롭게 즐겨보세요. 연습하면 반응속도가 향상됩니다!",
        position: "center",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      }
    ]
  },
  {
    id: "advanced-modes",
    name: "고급 게임 모드",
    description: "타겟 모드, 색상 매칭, 순서 기억 등 고급 모드를 배워보세요",
    prerequisite: ["basic-intro"],
    steps: [
      {
        id: "target-intro",
        title: "타겟 모드 소개 🎯",
        content: "타겟 모드에서는 화면에 나타나는 목표물을 정확하고 빠르게 클릭해야 합니다.",
        target: "[aria-label='타겟 모드 시작']",
        position: "bottom",
        action: "click",
        skippable: false,
        nextEnabled: false
      },
      {
        id: "target-gameplay",
        title: "타겟 클릭하기",
        content: "화면에 나타나는 원형 타겟을 클릭하세요. 정확도와 속도가 모두 중요합니다!",
        position: "center",
        action: "wait",
        duration: 5000,
        skippable: false,
        nextEnabled: true
      },
      {
        id: "color-mode",
        title: "색상 매칭 모드 🎨",
        content: "지시된 색상과 같은 색상을 빠르게 선택하는 모드입니다. 키보드 1-5번 키나 터치로 플레이하세요.",
        target: "[aria-label='색상 매칭 모드 시작']",
        position: "bottom",
        action: "none",
        duration: 4000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "sequence-mode",
        title: "순서 기억 모드 🧠",
        content: "나타나는 순서를 기억하고 같은 순서로 클릭하는 기억력 게임입니다. 도전해보세요!",
        target: "[aria-label='순서 기억 모드 시작']",
        position: "bottom",
        action: "none",
        duration: 4000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "ranked-mode",
        title: "랭킹 게임 모드 🏆",
        content: "10판의 평균 반응속도로 다른 플레이어와 순위를 겨루는 진정한 실력 테스트입니다!",
        target: "[aria-label='랭킹 게임 모드 시작']",
        position: "bottom",
        action: "none",
        duration: 4000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "advanced-complete",
        title: "고급 모드 학습 완료! ⭐",
        content: "이제 모든 게임 모드를 마스터했습니다. 연습을 통해 최고 기록에 도전해보세요!",
        position: "center",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      }
    ]
  },
  {
    id: "features-tour",
    name: "기능 둘러보기",
    description: "업적, 통계, 설정 등 다양한 기능을 알아보세요",
    prerequisite: ["basic-intro"],
    steps: [
      {
        id: "achievements",
        title: "업적 시스템 🏅",
        content: "다양한 업적을 달성하여 특별한 보상을 받으세요. 업적 보기를 클릭해보세요.",
        target: "button:has([class*='Trophy'])",
        position: "top",
        action: "click",
        skippable: false,
        nextEnabled: false
      },
      {
        id: "stats",
        title: "통계 및 분석 📊",
        content: "자신의 게임 기록과 발전 상황을 자세히 확인할 수 있습니다.",
        position: "center",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "settings",
        title: "설정 ⚙️",
        content: "테마, 알림, 개인화 설정 등을 변경할 수 있습니다.",
        target: "[class*='SettingsToggle']",
        position: "left",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "profile",
        title: "프로필 👤",
        content: "닉네임과 특성을 설정하여 자신만의 게이머 정체성을 만들어보세요.",
        target: "[class*='ProfileAvatar']",
        position: "left",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      },
      {
        id: "features-complete",
        title: "기능 둘러보기 완료! 🎊",
        content: "QuickTap Arena의 모든 기능을 살펴봤습니다. 이제 본격적으로 게임을 즐겨보세요!",
        position: "center",
        action: "none",
        duration: 3000,
        skippable: true,
        nextEnabled: true
      }
    ]
  }
];

export const getAvailableTutorials = (completedTutorials: string[]): TutorialFlow[] => {
  return tutorialFlows.filter(tutorial => {
    if (!tutorial.prerequisite) return true;
    return tutorial.prerequisite.every(prereq => completedTutorials.includes(prereq));
  });
};

export const getTutorialById = (id: string): TutorialFlow | undefined => {
  return tutorialFlows.find(tutorial => tutorial.id === id);
};