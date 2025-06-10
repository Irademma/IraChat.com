
export interface ParsedMention {
  userId: string;
  username: string;
  startIndex: number;
  endIndex: number;
}

export const parseMentions = (caption: string): ParsedMention[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: ParsedMention[] = [];
  let match;

  while ((match = mentionRegex.exec(caption)) !== null) {
    mentions.push({
      username: match[1],
      userId: '', // Will be populated when we have user data
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
};

export const replaceMentionsWithLinks = (
  caption: string,
  mentions: ParsedMention[],
  onMentionPress: (userId: string) => void
): { text: string; mentions: ParsedMention[] } => {
  let processedCaption = caption;
  const processedMentions: ParsedMention[] = [];

  // Sort mentions by start index in reverse order to avoid index shifting
  const sortedMentions = [...mentions].sort((a, b) => b.startIndex - a.startIndex);

  for (const mention of sortedMentions) {
    const mentionText = `@${mention.username}`;
    const linkText = `[${mentionText}](user:${mention.userId})`;
    processedCaption =
      processedCaption.slice(0, mention.startIndex) +
      linkText +
      processedCaption.slice(mention.endIndex);
    processedMentions.push(mention);
  }

  return {
    text: processedCaption,
    mentions: processedMentions,
  };
}; 