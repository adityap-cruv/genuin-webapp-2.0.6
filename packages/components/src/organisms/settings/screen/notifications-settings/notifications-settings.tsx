import { SettingRow } from "@genuin/components/molecules/setting-row";
import type { FC } from "react";

interface NotificationSettingsProps {
  group?: boolean;
  mentions?: boolean;
  comments?: boolean;
  replies?: boolean;
  reactionsPosts?: boolean;
  reactionsComments?: boolean;
  activity?: boolean;
  newMembers?: boolean;
  newRequests?: boolean;
  acceptedRequests?: boolean;
  onToggleGroup?: (val: boolean) => void;
  onToggleMentions?: (val: boolean) => void;
  onToggleComments?: (val: boolean) => void;
  onToggleReplies?: (val: boolean) => void;
  onToggleReactionsPosts?: (val: boolean) => void;
  onToggleReactionsComments?: (val: boolean) => void;
  onToggleActivity?: (val: boolean) => void;
  onToggleNewMembers?: (val: boolean) => void;
  onToggleNewRequests?: (val: boolean) => void;
  onToggleAcceptedRequests?: (val: boolean) => void;
}

export const NotificationSettings: FC<NotificationSettingsProps> = ({
  group,
  // mentions,
  // comments,
  // replies,
  // reactionsPosts,
  // reactionsComments,
  // activity,
  // newMembers,
  // newRequests,
  // acceptedRequests,
  onToggleGroup,
  // onToggleMentions,
  // onToggleComments,
  // onToggleReplies,
  // onToggleReactionsPosts,
  // onToggleReactionsComments,
  // onToggleActivity,
  // onToggleNewMembers,
  // onToggleNewRequests,
  // onToggleAcceptedRequests,
}) => {
  return (
    <>
      <h4 className="gencl:text-headline-4-medium gencl:mb-3">General</h4>
      <SettingRow
        label="Group notifications"
        subLabel="Allow notifications for groups you have joined"
        toggle
        toggleValue={group}
        onToggleChange={onToggleGroup}
      />

      {/* <h4 className="gencl:text-headline-4-medium gencl:mt-6 gencl:mb-2">Activity</h4>
      <SettingRow label="Mentions of username" toggle toggleValue={mentions} onToggle={onToggleMentions} />
      <SettingRow label="Comments on your posts" toggle toggleValue={comments} onToggle={onToggleComments} />
      <SettingRow label="Replies to your comments" toggle toggleValue={replies} onToggle={onToggleReplies} />
      <SettingRow label="Reactions on your posts" toggle toggleValue={reactionsPosts} onToggle={onToggleReactionsPosts} />
      <SettingRow label="Reactions on your comments" toggle toggleValue={reactionsComments} onToggle={onToggleReactionsComments} />
      <SettingRow label="Activity on posts you’re mentioned" toggle toggleValue={activity} onToggle={onToggleActivity} />
      <SettingRow
        label="New members joined"
        subLabel="in communities and/or groups you’re in"
        toggle
        toggleValue={newMembers}
        onToggle={onToggleNewMembers}
      />
      <SettingRow
        label="New member requests"
        subLabel="in communities and/or groups you’re an admin"
        toggle
        toggleValue={newRequests}
        onToggle={onToggleNewRequests}
      />
      <SettingRow
        label="Accepted member requests"
        toggle
        toggleValue={acceptedRequests}
        onToggle={onToggleAcceptedRequests}
      /> */}
    </>
  );
};
