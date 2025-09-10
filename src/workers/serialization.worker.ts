self.onmessage = (event) => {
  const { metadata, items } = event.data;

  const compactData = {
    version: metadata.format_version,
    creator: metadata.creator,
    created_at: metadata.created_at,
    canvas_bounds: metadata.canvas_bounds,
    presets: metadata.presets,
    items: items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title || 'Untitled',
      position: item.position,
      dimensions: item.dimensions,
      content: typeof item.content === 'string' && item.content.length > 10000 
        ? item.content.substring(0, 10000) + '...[workspace-truncated]' 
        : item.content,
      is_contextual: item.is_contextual,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
  };
  
  const jsonString = JSON.stringify(compactData);
  const encoder = new TextEncoder();
  const buffer = encoder.encode(jsonString).buffer;

  self.postMessage({ snapshot: buffer }, [buffer]);
};