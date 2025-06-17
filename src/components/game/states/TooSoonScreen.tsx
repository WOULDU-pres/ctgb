
const TooSoonScreen = () => {
  return (
    <div className="text-center animate-fade-in" role="alert">
      <h2 className="text-4xl sm:text-5xl font-bold text-background mb-4">너무 빨랐습니다!</h2>
      <p className="text-base sm:text-lg text-background/80">클릭하여 다음 라운드로 진행하세요.</p>
    </div>
  );
};

export default TooSoonScreen;
