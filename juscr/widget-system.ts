// JUSCR Widget System Integration

export interface JUSCRWidget {
  id: string;
  name: string;
  version: string;
  mount: (container: HTMLElement, props?: any) => void;
  unmount?: () => void;
  update?: (props: any) => void;
}

const registry: Record<string, () => Promise<JUSCRWidget>> = {};

export function registerWidget(id: string, loader: () => Promise<JUSCRWidget>) {
  registry[id] = loader;
}

export async function loadWidget(id: string, container: HTMLElement, props?: any) {
  if (!registry[id]) {
    throw new Error(`Widget ${id} not registered`);
  }

  const widget = await registry[id]();
  widget.mount(container, props);
  return widget;
}

// Example default widget
export const DefaultWidget: JUSCRWidget = {
  id: "juscr-default",
  name: "JUSCR Core Widget",
  version: "1.0.0",
  mount(container, props) {
    container.innerHTML = `\n      <div class=\"juscr-widget\">\n        <h2>JUSCR Active</h2>\n        <p>${props?.message || "System initialized"}</p>\n      </div>\n    `;
  }
};
