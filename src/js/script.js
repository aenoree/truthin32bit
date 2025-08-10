// page transitions

window.addEventListener("pagereveal", ({ viewTransition }) => {
  // Skip if view transitions aren't supported
  if (!viewTransition) return;

  // Uses the Navigation API
  const { navigationType, entry, from } = navigation.activation;

  // Check if this is browser back/forward navigation
  const isTraverseNav = navigationType === "traverse";
  // For traverse navigation, compare the order to determine direction
  const isBackward = isTraverseNav && entry.index < from.index;

  // Add the appropriate transition type
  viewTransition.types.add(isBackward ? "backward" : "forward");
});
