export function GridGuide() {
  return (
    <>
      <div className="sticky h-[2px] bg-blue-300 col-gutter-left"></div>
      <div className="sticky h-[2px] bg-green-300 col-body"></div>
      <div className="sticky h-[2px] bg-yellow-300 col-margin"></div>
      <div className="sticky h-[2px] bg-blue-300 col-gutter-right"></div>
    </>
  );
}
