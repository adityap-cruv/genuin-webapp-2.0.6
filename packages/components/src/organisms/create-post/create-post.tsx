"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@genuin/components/hooks/use-router";
import { v4 as uuid } from "uuid";
import { Avatar, Button, Toast } from "@genuin/ui/components";
import {
  DiamondIcon,
  ImportIcon,
  OctopusIcon,
  UploadFileIcon,
} from "@genuin/ui/icons";
import { CommunityGroupSelector } from "@genuin/components/molecules/community-group-selector";
import FileSelectDropzone from "@genuin/components/molecules/file-select-dropzone/file-select-dropzone";
import { MediaModal } from "@genuin/components/molecules/link-thumbnail/link-thumbnail-modal";
import { usePostCreateUploadUrlMutation } from "@genuin/components/react-query/api/posts/post-video-upload";
import { useDeleteDraftsMutation } from "@genuin/components/react-query/api/posts/delete-drafts";
import { useAuthContext } from "@genuin/components/context/auth";
import { MentionInput } from "@genuin/components/molecules/mention-input";
import {
  useGetDraftVideoMutation,
  useEditDraftVideoMutation,
  useCreateDraftVideoMutation,
} from "@genuin/components/react-query/api/posts/video-draft";
import {
  useEditActiveVideoMutation,
  useGetActiveVideoMutation,
  usePostVideoMutation,
} from "@genuin/components/react-query/api/posts/active-post";
import { EditVideoTrim } from "./edit-video-trim";
import { EditPostSkeleton } from "./edit-post-skeleton";
import { PostLayout } from "../post-layout";
import { PostPlayer } from "../post-player";
import { AddLinkOut } from "../add-linkout";
import SaveDraftDialog from "./save-draft-dialog";
import { FileDetails, PostData, StepPost } from "./types";
import { PostOriginCard } from "../post-origin-card";
import { AddLoactionPanel, Location } from "../add-location-panel";
import { EditCoverImage, EditCoverImageHandle } from "../edit-cover-image";
import {
  SectionLayout,
  SectionLayoutLeft,
  SectionLayoutRight,
} from "./section-layout";

interface CreatePostProps {
  postId?: string;
  draftId?: string;
}

const DESC_MAX_LENGTH = 2000;
const UPLOAD_VIDEO_PATH = "temp_video";
const UPLOAD_IMAGE_PATH = "uploads/thumbnails";

const DiamondIconComponent = () => (
  <div className="gencl:w-6 gencl:h-6 gencl:bg-primary-200 gencl:rounded-md gencl:flex gencl:items-center gencl:justify-center">
    <DiamondIcon className="gencl:size-4" />
  </div>
);

export const CreatePost = ({ postId, draftId }: CreatePostProps) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const ref = useRef<EditCoverImageHandle>(null);

  const [postData, setPostData] = useState<PostData>();
  const [step, setStep] = useState<StepPost>(
    postId || draftId ? "POST" : "UPLOAD"
  );
  const [fileDetails, setFileDetails] = useState<FileDetails>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [groupId, setGroupId] = useState(null);
  const [videoTrimProcessing, setVideoTrimProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(postId || draftId ? true : false);
  const [openSaveDraftDialog, setOpenSaveDraftDialog] = useState(false);
  const [location, setLocation] = useState<PostData["video"]["location"]>(null);
  const [isTrimmerReady, setIsTrimmerReady] = useState(true);
  const [postPayload, setPostPayload] = useState({});
  const showTrimButton = useMemo(() => !postId, [postId]);
  const [thumbnail, setThumbnail] = useState("");
  const [isAutoSaveMsg, setIsAutoSaveMsg] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false); // Video uploading loader

  // Reusable function to handle success while get details
  const handleVideoSuccess =
    (nextStep: StepPost, showMessage?: boolean) => (data: any) => {
      if (data?.res?.data?.code === 200) {
        const video = data.res.data.data.video;
        setPostData({ ...data.res.data.data });
        setLocation(video.location);
        setThumbnail(video.thumbnail);
        setGroupId(null);
        setIsLoading(false);
        setIsVideoUploading(false);
        if (nextStep) {
          setStep(nextStep);
        }
        if (showMessage) setIsAutoSaveMsg(true);
      }
    };

  // Reusable function to handle error
  const handleVideoError = () => {
    Toast.Error({
      message: "Failed to get data. Please try again later.",
    });
  };

  // initial draft Video
  const { mutate: createDraftVideo } = useCreateDraftVideoMutation({
    onSuccess: handleVideoSuccess("POST"),
    onError: handleVideoError,
  });

  // Get Active Video
  const { mutate: getActiveVideo } = useGetActiveVideoMutation({
    onSuccess: handleVideoSuccess("POST"),
    onError: handleVideoError,
  });

  // Get Draft Video
  const { mutate: getDraftVideo } = useGetDraftVideoMutation({
    onSuccess: handleVideoSuccess("POST"),
    onError: handleVideoError,
  });

  // Edit active Video
  const { mutate: editActiveVideoPatch, isPending: isLoadingActivePost } =
    useEditActiveVideoMutation({
      onSuccess: ({ res }) => {
        if (res.data.code === 200) {
          setThumbnail(res.data.data.message.thumbnail_url);
          if (step === "POST") {
            router.push("/posts");
          }
          Toast.Success({
            message: "Post updated successfully.",
          });
        }
      },
      onError: () => {
        Toast.Error({
          message: "Failed to edit post. Please try again later.",
        });
      },
    });

  // Edit Draft Video
  const { mutate: editDraftVideoPatch } = useEditDraftVideoMutation({
    onSuccess: handleVideoSuccess("POST", true),
    onError: handleVideoError,
  });

  // Delete draft post
  const { mutateAsync: deleteDraftPost, isPending: isDraftDeleting } =
    useDeleteDraftsMutation({
      onSuccess: () => router.push("/posts"),
      onError: (error) => {
        console.error("Failed to delete draft:", error);
      },
    });

  useEffect(() => {
    const id = postId || draftId;
    if (!id) return;

    setIsLoading(true);
    setStep("POST");

    const fetchVideo = postId ? getActiveVideo : getDraftVideo;
    fetchVideo({ uuid: id });
  }, [postId, draftId]);

  // Upload Video
  const { mutate: generateUploadUrl } = usePostCreateUploadUrlMutation({
    onSuccess: (res) => {
      if (res && step === "EDIT_THUMBNAIL") {
        setStep("POST");
        if (!postId) {
          updatePostData({
            thumbnail_name: `${UPLOAD_IMAGE_PATH}/${fileDetails?.file?.name}`,
          });
        }
        setIsVideoUploading(false);
      }
      if (
        !res ||
        res.code !== 200 ||
        !fileDetails ||
        !fileDetails.videoThumbnail
      ) {
        return;
      }

      const {
        aspectRatio = "9:16",
        resolution = "1080x1920",
        videoDuration,
        file,
        videoThumbnail,
      } = fileDetails;

      if (groupId) {
        updatePostData({
          aspect_ratio: aspectRatio,
          resolution,
          duration: videoDuration?.toString() ?? "",
          size: file?.size?.toString() ?? "",
          meta_data: {
            contains_external_videos: false,
            media_type: "video",
          },
          video_name: file?.name ? `${UPLOAD_VIDEO_PATH}/${file.name}` : "",
          thumbnail_name: videoThumbnail
            ? `${UPLOAD_IMAGE_PATH}/${videoThumbnail}`
            : ``,
        });
      }
    },
    onError: () => {
      Toast.Error({
        message: "Failed to upload details. Please try again later.",
      });
      setIsVideoUploading(false);
    },
    onMutate: () => setIsVideoUploading(true),
  });

  // handle edit video action
  const handleEditAction = (type: "clip" | "cover", url?: string) => {
    setIsAutoSaveMsg(false);
    if (type === "clip") {
      setStep("CLIP_VIDEO");
      // Reset trimmer state if not in clip mode
      if (step !== "CLIP_VIDEO") {
        setIsTrimmerReady(false);
      }
    }
    if (type === "cover") {
      setStep("EDIT_THUMBNAIL");
      setVideoUrl(url || null);
    }
  };

  // handle generate duration, thumbnail image and upload video
  const handleFileChange = useCallback(
    (file: File) => {
      if (!file) return;

      // upload video
      const extension = file.name.split(".").pop();
      const newFileName = `${uuid()}.${extension}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      video.src = URL.createObjectURL(file);
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        const duration = video.duration;
        setFileDetails((prev) => ({ ...prev, videoDuration: duration, file }));
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = Math.min(1, duration / 2);
      };

      video.onseeked = () => {
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `${uuid()}.png`, {
              type: "image/png",
            });

            setFileDetails((prev) => ({
              ...prev,
              videoThumbnail: thumbnailFile.name,
              file: renamedFile,
            }));

            // upload thumbnail
            if (thumbnailFile) {
              generateUploadUrl({ file: thumbnailFile, kind: "image" });
            }
            if (renamedFile) {
              generateUploadUrl({ file: renamedFile, kind: "video" });
            }
          }
        }, "image/png");
      };
    },
    [generateUploadUrl]
  );

  // handle save add button
  const handleAddLocation = (props: Location | null) => {
    const locationPayload = {
      location: props ? props : null,
    };
    if (!postId) {
      updatePostData(locationPayload);
    } else {
      setPostPayload((prev) => ({
        ...prev,
        location: props ? props : null,
      }));
    }
    setLocation(locationPayload?.location);
  };

  // Move draft to active video
  const { mutate: videoPost, isPending: isLoadingPost } = usePostVideoMutation({
    onSuccess: ({ res }) => {
      if (res.data.code === 200) {
        Toast.Success({ message: res.data.message });
        router.push("/posts");
      }
    },
    onError: () => {
      Toast.Error({
        message: "Failed to post. Please try again later.",
      });
    },
  });

  const handleTrimVideoRef = useRef<{ handleTrim: () => void }>(null);

  const handleNextButton = async (step: StepPost) => {
    if (step === "POST" && !postId) {
      videoPost({
        uuid: postData?.video?.id,
      });
    }
    if (step === "POST" && postId) {
      if (Object.keys(postPayload).length > 0) {
        editActiveVideoPatch({
          ...postPayload,
          cv_id: postId,
        });
      }
    }
    if (step === "EDIT_THUMBNAIL") {
      const file = await ref.current?.captureImage();
      if (file) {
        const extension = file.name.split(".").pop();
        const newFileName = `${uuid()}.${extension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });
        if (renamedFile) {
          setFileDetails((prev) => ({
            ...prev,
            file: renamedFile,
          }));

          generateUploadUrl({ file: renamedFile, kind: "image" });
          if (postId) {
            setPostPayload((prev) => ({
              ...prev,
              video_thumbnail: `${UPLOAD_IMAGE_PATH}/${renamedFile?.name}`,
            }));
          }
        }
      } else {
        setStep("POST");
      }
    }
    if (step === "CLIP_VIDEO") {
      handleTrimVideoRef.current?.handleTrim();
    }
  };

  const handleCancelButton = (step: StepPost) => {
    if (step === "POST" && !postId) {
      setOpenSaveDraftDialog(true);
      return;
    }

    if (step === "UPLOAD") {
      router.push("/posts");
    }

    if (step === "POST") {
      setFileDetails({});
      setGroupId(null);
      router.push("/posts");
    }

    if (step === "CLIP_VIDEO" || step === "EDIT_THUMBNAIL") {
      setStep("POST");
    }
  };

  // chat_id create post
  // uuid for edit draft post
  // cv_id for edit post (Publish post)
  // groupId initial set in state while create draft
  const getIdentifier = () => {
    if (groupId) return { chat_id: groupId };
    if (!draftId && !postId && postData?.video?.id)
      return { uuid: postData.video.id };
    if (draftId) return { uuid: draftId };
    return { chat_id: "" }; // fallback
  };

  const updatePostData = (dataToUpdate: Record<string, any>) => {
    if (!dataToUpdate) return;
    const identifier = getIdentifier();
    const requestBody = { ...identifier, ...dataToUpdate };
    const updateFunction =
      draftId || postData?.group?.id ? editDraftVideoPatch : createDraftVideo;

    updateFunction(requestBody);
  };

  if (isLoading) {
    return <EditPostSkeleton />;
  }

  return (
    <PostLayout
      isEdit={postId ? true : false}
      bottomMessage={
        isAutoSaveMsg ? `Your progress is automatically saved as a draft.` : ""
      }
      bottomMessageKey={Date.now()}
      postCountText=""
      isPostDisabled={
        isVideoUploading ||
        isLoadingPost ||
        videoTrimProcessing ||
        !isTrimmerReady ||
        isLoadingActivePost ||
        postPayload?.description_text?.length === DESC_MAX_LENGTH ||
        (!Object.keys(postPayload).length && !!postId && step === "POST")
      }
      onCancel={handleCancelButton}
      onNext={handleNextButton}
      stepNextButton={step}
      isLoading={
        isVideoUploading ||
        isLoadingPost ||
        videoTrimProcessing ||
        isLoadingActivePost
      }
    >
      <SaveDraftDialog
        open={openSaveDraftDialog}
        onOpenChange={setOpenSaveDraftDialog}
        onSaveDraft={() => router.push("/posts")}
        onDelete={() => {
          if (postId) return;
          deleteDraftPost([draftId || postData?.video?.id || ""]);
        }}
        isDeleting={isDraftDeleting}
      />

      {step === "UPLOAD" && (
        <div className="gencl:w-full gencl:h-full gencl:bg-white gencl:overflow-auto">
          <div className="gencl:border-b-4 gencl:border-secondary-50 gencl:pt-4 gencl:px-6">
            <p className="gencl:text-body-0-semi-bold gencl:mb-4">
              Post to<span className="gencl:text-red">*</span>
            </p>
            <CommunityGroupSelector
              onSelectChange={(comId: string, grpId: string | null) => {
                setGroupId(grpId);
              }}
            />
          </div>
          <div className="gencl:pt-4 gencl:px-6">
            <div className="gencl:flex gencl:gap-3 gencl:text-body-0-semi-bold gencl:mb-4">
              Upload <DiamondIconComponent />
            </div>
            <FileSelectDropzone
              onFileChange={handleFileChange}
              isLoading={isVideoUploading}
              showErrorMessage={false}
              containerProps={{ className: "gencl:mb-5 gencl:min-h-[180px]" }}
              disabled={!groupId}
              config={{
                // allowedFileTypes: ["MP4", "MOV", "AVI", "MKV", "WEBM", "WMV"],
                allowedFileTypes: ["MP4", "WEBM"],
                maxFileSize: 2000,
                messages: {
                  uploadInfo:
                    // "Supported: mp4, mov, avi, wmv, mkv, webm · Up to 2 GB · Max 300 seconds · 9:16 aspect ratio",
                    "Supported: mp4, webm · Up to 2 GB · Max 300 seconds · 9:16 aspect ratio",
                  uploadFailed:
                    // "Upload failed. File must be mp4, mov, avi, wmv, mkv, webm, under 2GB, min 4s, max 300s, 9:16 ratio.",
                    "Upload failed. File must be mp4, webm, under 2GB, min 4s, max 300s, 9:16 ratio.",
                },
                validation: {
                  video: {
                    aspectRatio: "9:16",
                    minDuration: 4,
                    maxDuration: 300,
                  },
                },
              }}
            />
          </div>
          <div className="gencl:pb-5 gencl:flex gencl:gap-6 gencl:px-6">
            {[
              {
                icon: <ImportIcon />,
                title: "Import Videos from Socials",
                description: "Connect to Instagram, TikTok or YouTube.",
              },
              {
                icon: <OctopusIcon />,
                title: "Generate Video with AI",
                description: "Use a prompt or images to create an AI ad.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="gencl:opacity-40 gencl:w-full gencl:border gencl:border-secondary-150 gencl:rounded-lg gencl:p-5 gencl:flex gencl:gap-3 gencl:items-center"
              >
                <div className="gencl:w-12 gencl:h-12 gencl:bg-primary-200 gencl:rounded-2xl gencl:flex gencl:items-center gencl:justify-center">
                  {item.icon}
                </div>
                <div>
                  <h4 className="gencl:text-body-1-semi-bold gencl:mb-1 gencl:flex gencl:items-center gencl:gap-2">
                    {item.title} <DiamondIconComponent />
                  </h4>
                  <p className="gencl:text-body-2-medium gencl:text-secondary-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "POST" && (
        <SectionLayout>
          <SectionLayoutLeft>
            <PostPlayer
              className="gencl:h-full"
              editClipVideo={() => handleEditAction("clip")}
              editCoverImage={(url) => handleEditAction("cover", url)}
              post={postData}
              showClipVideoBtn={showTrimButton}
            />
          </SectionLayoutLeft>
          <SectionLayoutRight>
            <div className="gencl:text-secondary-600 gencl:flex gencl:gap-2 gencl:items-center gencl:mb-8">
              <span className="gencl:text-body-1-medium">Posting by</span>
              <div className="gencl:flex gencl:bg-secondary-100 gencl:py-1 gencl:ps-1 gencl:pe-2 gencl:rounded-3xl gencl:items-center gencl:gap-2">
                <Avatar
                  alt={user?.name ?? ""}
                  imageUrl={user?.image ?? ""}
                  isAvatar
                  size="sm"
                />
                <span className="gencl:text-secondary-900 gencl:text-body-1-medium">
                  @{user?.nickname}
                </span>
              </div>
            </div>

            <div className="gencl:relative gencl:mb-7">
              <MentionInput
                postId={postId}
                videoId={postData?.video?.id ?? ""}
                loopId={postData?.group?.id ?? ""}
                inputType="textarea"
                maxLength={DESC_MAX_LENGTH}
                defaultValue={postData?.video?.descriptionText}
                onPayload={(payload) => {
                  if (postId) {
                    setPostPayload((prev) => ({
                      ...prev,
                      ...payload,
                    }));
                  } else {
                    editDraftVideoPatch({
                      uuid: postData?.video?.id,
                      ...payload,
                    });
                  }
                }}
              />
            </div>
            <div className="gencl:mb-2">
              <AddLinkOut
                onPayload={(payload) => {
                  if (postId) {
                    setPostPayload((prev) => ({
                      ...prev,
                      linkouts: payload?.linkouts,
                    }));
                  } else {
                    updatePostData(payload);
                  }
                }}
                initialLinkouts={postData?.video?.linkouts}
              />
            </div>
            <div className="gencl:mb-2">
              <AddLoactionPanel
                location={location}
                onSelectionChange={handleAddLocation}
              />
            </div>
            {postId ? (
              <div className="gencl:mb-2 gencl:mt-5">
                <PostOriginCard
                  community={{
                    name: postData?.community?.name,
                    profileImage:
                      postData?.community?.profileImageM ||
                      postData?.community?.profileImage,
                    slug: postData?.community?.slug,
                    isPrivate: postData?.community.type === 2,
                  }}
                  group={{
                    name: postData?.group?.name,
                    slug: postData?.group?.slug,
                    actions: postData?.group?.actions,
                  }}
                />
              </div>
            ) : (
              <div className="gencl:mb-2 gencl:mt-5">
                <p className="gencl:text-body-1-semi-bold gencl:mb-2">
                  Post to<span className="gencl:text-red">*</span>
                </p>
                <CommunityGroupSelector
                  communityId={postData?.community?.id ?? ""}
                  groupId={postData?.group?.id ?? ""}
                  onSelectChange={(comId: string, grpId: string | null) => {
                    if (grpId) {
                      updatePostData({ chat_id: grpId });
                    }
                  }}
                />
              </div>
            )}
          </SectionLayoutRight>
        </SectionLayout>
      )}

      {step === "EDIT_THUMBNAIL" && (
        <SectionLayout>
          <SectionLayoutLeft>
            <img src={thumbnail} className="gencl:h-full" />
          </SectionLayoutLeft>
          <SectionLayoutRight>
            <div className="gencl:flex gencl:items-center gencl:justify-between gencl:mb-5">
              <p className="gencl:text-body-0-semi-bold">Edit Cover Image</p>
              <MediaModal
                type="media-upload"
                title="Media Upload"
                uploadPath="uploads/thumbnails"
                fileNamePrefix="thumbnail"
                aspectRatio={9 / 16}
                roundCrop={false}
                onImageChange={({ file }) => {
                  if (!file) return;

                  const fileName = file.name;
                  const imagePath = `${UPLOAD_IMAGE_PATH}/${fileName}`;

                  if (postId) {
                    setPostPayload((prev) => ({
                      ...prev,
                      video_thumbnail: imagePath,
                    }));

                    setThumbnail(
                      `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL}/${imagePath}`
                    );
                  } else {
                    updatePostData({ thumbnail_name: imagePath });
                  }
                }}
              >
                <Button theme="outline">
                  <UploadFileIcon variant="black" /> Upload Cover
                </Button>
              </MediaModal>
            </div>
            <EditCoverImage
              ref={ref}
              videoURL={videoUrl ?? ""}
              thumbHeight={90}
            />
          </SectionLayoutRight>
        </SectionLayout>
      )}

      {step === "CLIP_VIDEO" && (
        <EditVideoTrim
          ref={handleTrimVideoRef}
          postData={postData}
          playerOverlayAction={handleEditAction}
          updatePostData={updatePostData}
          setVideoTrimProcessing={setVideoTrimProcessing}
          onTrimmerReady={(isReady) => setIsTrimmerReady(isReady)}
          // Hide the trim video button when editing a published post or during video clipping
          showTrimVideoBtn={showTrimButton && step !== "CLIP_VIDEO"}
          // Show the edit cover button only when not in the video clipping step
          showEditCoverBtn={step !== "CLIP_VIDEO"}
        />
      )}
    </PostLayout>
  );
};
