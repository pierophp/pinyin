export function parseBible(item: string | undefined): string | undefined {
  if (!item) {
    return;
  }

  const indexOfBible = item.indexOf('<bible');

  if (indexOfBible >= 0) {
    const bible = item.match(/\<bible text="(.*?)"\>/);
    if (bible && bible[1]) {
      return bible[1];
    }
  }
}
