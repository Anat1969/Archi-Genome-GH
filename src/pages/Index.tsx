import { useState } from 'react';
import { useColorWheel } from '@/hooks/useColorWheel';
import ColorWheel from '@/components/ColorWheel';
import WheelControls from '@/components/WheelControls';
import ColorAnalysis from '@/components/ColorAnalysis';
import TopNav from '@/components/TopNav';

const Index = () => {
  const wheel = useColorWheel();
  const [maskOpacity, setMaskOpacity] = useState(72);

  return (
    <div dir="rtl" className="newton-app min-h-screen"
      style={{ background: 'radial-gradient(circle at top, #1d2230 0%, #0f1115 45%, #0b0d11 100%)' }}>
      <TopNav />
      <div className="max-w-[1380px] mx-auto p-6 pt-20 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,460px)_1fr] gap-6 items-start">
        <WheelControls
          selectionLimit={wheel.selectionLimit}
          mode={wheel.mode}
          openedCount={wheel.opened.length}
          structureName={wheel.structureName}
          historyLength={wheel.history.length}
          maskOpacity={maskOpacity}
          onChangeLimit={wheel.changeLimit}
          onSetMode={wheel.setMode}
          onRotateForward={wheel.rotateForward}
          onRotateBack={wheel.rotateBack}
          onReset={wheel.resetHoles}
          onNewPattern={wheel.newPattern}
          onUndo={wheel.undo}
          onMaskOpacityChange={setMaskOpacity}
        />

        <main className="newton-panel p-4 space-y-4">
          <ColorWheel
            rotationOffset={wheel.rotationOffset}
            isOpened={wheel.isOpened}
            canSelectByMode={wheel.canSelectByMode}
            onCellClick={wheel.onCellClick}
            selectionLimit={wheel.selectionLimit}
            openedCount={wheel.opened.length}
            maskOpacity={maskOpacity}
          />

          <ColorAnalysis
            analysis={wheel.analysis}
            revealedColors={wheel.revealedColors}
            decomposition={wheel.decomposition}
          />
        </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
