export type SelectedMention = {
  handle: string;
  id: string | number;
  slug?: string;
  type: "member" | "community" | "url";
};

/**
 * Converts a comment text containing mentions into an array of strings and objects.
 * @param commentText - The text of the comment containing mentions.
 * @param selectedMentions - The list of mentions to include in the conversion.
 * @returns An array of strings and objects representing the comment text and mentions.
 */
export const convertCommentTextToArray = (
  commentText: string,
  selectedMentions: SelectedMention[]
) => {
  const result: Array<string | object> = [];
  const words = commentText.split(" ");
  let lastIndex = 0;

  words.forEach((word, index) => {
    const matchedMention = selectedMentions.find(
      (mention) => mention.handle === word.trim()
    );

    if (matchedMention) {
      const textBefore = commentText.slice(
        lastIndex,
        commentText.indexOf(word, lastIndex)
      );
      if (textBefore.trim()) {
        result.push(textBefore);
      } else if (
        result.length > 0 &&
        typeof result[result.length - 1] === "object"
      ) {
        result.push(" ");
      }

      if (matchedMention.type === "member") {
        result.push({
          member_id: matchedMention.id,
          text: matchedMention.handle,
        });
      } else if (matchedMention.type === "community") {
        result.push({
          community_id: matchedMention.id,
          text: matchedMention.handle,
          slug: matchedMention.slug,
        });
      } else if (matchedMention.type === "url") {
        result.push({
          url: matchedMention.handle,
          text: matchedMention.handle,
        });
      }

      lastIndex = commentText.indexOf(word, lastIndex) + word.length;
    } else if (index === words.length - 1) {
      const remainingText = commentText.slice(lastIndex);
      if (remainingText) {
        result.push(remainingText);
      }
    }
  });

  return result;
};
