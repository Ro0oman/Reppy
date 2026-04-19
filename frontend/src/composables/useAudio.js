import { useAudioStore } from '../stores/audio';

export function useAudio() {
  const audioStore = useAudioStore();

  const playZip = () => audioStore.play('zip');
  const playHit = () => audioStore.play('hit');
  const playEquip = () => audioStore.play('equip');
  const playLevelUp = () => audioStore.play('level_up');
  const playChest = () => audioStore.play('chest');
  
  // High-tech tactical blips (generated via code, no assets needed)
  const playClickBlip = () => audioStore.playBlip(1200, 0.05, 'square');
  const playHoverBlip = () => audioStore.playBlip(800, 0.03, 'sine');
  const playEquipBlip = () => audioStore.playBlip(1500, 0.1, 'triangle');

  return {
    playZip,
    playHit,
    playEquip,
    playLevelUp,
    playChest,
    playClickBlip,
    playHoverBlip,
    playEquipBlip,
    toggleMute: audioStore.toggleMute,
    isMuted: () => audioStore.isMuted
  };
}
