export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  interact: boolean;
  interactPressed: boolean;
  fire: boolean;
  firePressed: boolean;
  useBandage: boolean;
  useBandagePressed: boolean;
  useWater: boolean;
  useWaterPressed: boolean;
  mouseX: number;
  mouseY: number;
}

export function createInput(): InputState {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false,
    interact: false,
    interactPressed: false,
    fire: false,
    firePressed: false,
    useBandage: false,
    useBandagePressed: false,
    useWater: false,
    useWaterPressed: false,
    mouseX: 0,
    mouseY: 0,
  };
}

export function bindInput(canvas: HTMLCanvasElement, input: InputState): () => void {
  const down = new Set<string>();

  const sync = (): void => {
    input.up = down.has("KeyW") || down.has("ArrowUp");
    input.down = down.has("KeyS") || down.has("ArrowDown");
    input.left = down.has("KeyA") || down.has("ArrowLeft");
    input.right = down.has("KeyD") || down.has("ArrowRight");
    input.sprint = down.has("ShiftLeft") || down.has("ShiftRight");
    input.interact = down.has("KeyE");
    input.useBandage = down.has("Digit1");
    input.useWater = down.has("Digit2");
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    if (!down.has(e.code)) {
      if (e.code === "KeyE") input.interactPressed = true;
      if (e.code === "Digit1") input.useBandagePressed = true;
      if (e.code === "Digit2") input.useWaterPressed = true;
    }
    down.add(e.code);
    sync();
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    down.delete(e.code);
    sync();
  };

  const onMouseMove = (e: MouseEvent): void => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    input.mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;
  };

  const onMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) {
      input.fire = true;
      input.firePressed = true;
    }
  };

  const onMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) input.fire = false;
  };

  const onBlur = (): void => {
    down.clear();
    input.fire = false;
    sync();
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("blur", onBlur);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("blur", onBlur);
  };
}

export function endFrameInput(input: InputState): void {
  input.interactPressed = false;
  input.firePressed = false;
  input.useBandagePressed = false;
  input.useWaterPressed = false;
}
