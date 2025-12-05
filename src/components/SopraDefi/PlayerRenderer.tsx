import type { Player } from '../../types/player';
import { renderStickminPlayer } from './StickminPlayer';

interface PlayerRendererProps {
  player: Player;
  ctx: CanvasRenderingContext2D;
  animationFrame: number;
}

export const renderPlayer = ({ player, ctx, animationFrame }: PlayerRendererProps): void => {
  // Utiliser le renderer Stickmin basé sur les assets
  renderStickminPlayer({ player, ctx, animationFrame });
};

