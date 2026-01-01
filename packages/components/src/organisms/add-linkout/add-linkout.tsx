"use client";

import React, { useEffect, useMemo, useState, type FC } from "react";
import { v4 as uuid } from "uuid";
import { Switch } from "@genuin/ui/components/switch";
import { AddButton } from "../add-linkout-button";
import { AddLinkCard } from "../add-linkout-card";
import { AddLinks } from "../add-linkout-form";

import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@genuin/ui/components/accordion";
import { Button } from "@genuin/ui/components/button";
import { LinkIcon } from "@genuin/ui/icons";

export type CardItems = {
  id: string;
  image: string;
  link: string;
  title: string;
  position: number;
};

type AddLinkOutProps = {
  onPayload: (payload: {
    linkouts: Array<{
      cta_link?: string;
      cta_text?: string;
      links?: Array<{
        image: string;
        link: string;
        position: number;
        title: string;
      }>;
    }> | null;
  }) => void;
  initialLinkouts?: any;
};

export const AddLinkOut: FC<AddLinkOutProps> = ({
  onPayload,
  initialLinkouts,
}) => {
  const MAX_LINKS = 4;
  const hasCTA = useMemo(() => {
    const primaryLinkout = initialLinkouts?.[0];
    if (!primaryLinkout) return false;

    const { cta_link: ctaLink, cta_text: ctaText } = primaryLinkout;
    const isValidLink =
      typeof ctaLink === "string" && ctaLink.trim().length > 0;
    const isValidText =
      typeof ctaText === "string" && ctaText.trim().length > 0;
    return isValidLink && isValidText;
  }, [initialLinkouts]);

  const [cards, setCards] = useState<CardItems[]>([]);
  const [ctaData, setCtaData] = useState({
    cta_link: initialLinkouts?.[0]?.cta_link ?? "",
    cta_text: initialLinkouts?.[0]?.cta_text ?? "",
  });
  const [addToggle, setAddToggle] = useState(hasCTA);
  const [showForm, setShowForm] = useState(false);
  const [editItems, setEditItems] = useState<CardItems | undefined>();
  const [showAddCTAForm, setShowAddCTAForm] = useState(false);

  // set initial linkouts links
  useEffect(() => {
    if (initialLinkouts?.[0]?.links.length) {
      setCards(initialLinkouts?.[0]?.links);
    } else {
      setCards([]);
    }
  }, [initialLinkouts]);

  const handleAccordionToggle = (accordionId: string) => {
    // Close all forms when accordion is collapsed
    if (!accordionId) {
      setShowForm(false);
      setEditItems(undefined);
      setShowAddCTAForm(false);
    }

    if (initialLinkouts?.[0]?.links.length && hasCTA) {
      setAddToggle(true);
    }
  };

  const sendCardsPayload = (cardsList: CardItems[]) => {
    if (cardsList.length === 0) {
      onPayload({ linkouts: null });
      // Reset CTA state when all cards are deleted
      setAddToggle(false);
      setCtaData({ cta_link: "", cta_text: "" });
    } else {
      // Only include cta_link and cta_text if they are non-empty
      const ctaPayload =
        ctaData.cta_link?.trim() || ctaData.cta_text?.trim()
          ? {
              cta_link: ctaData.cta_link,
              cta_text: ctaData.cta_text,
            }
          : {};

      onPayload({
        linkouts: [
          {
            ...ctaPayload,
            links: cardsList,
          },
        ],
      });
    }
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return url?.split("/").pop() ?? url;
    } catch {
      return url;
    }
  };

  const handleSaveAddLink = ({
    url,
    title,
    image,
  }: {
    url: string;
    title: string;
    image: string;
  }) => {
    let updatedCards: CardItems[];

    if (editItems) {
      // Edit existing card
      updatedCards = cards.map((card) =>
        card.id === editItems.id ? { ...card, link: url, title, image } : card
      );
    } else {
      // Add new card
      const newCard: CardItems = {
        id: uuid(),
        image,
        link: url,
        title,
        position: cards.length + 1,
      };
      updatedCards = [...cards, newCard];
    }

    // Recalculate position in all cases
    const reOrdered = updatedCards.map((card, idx) => ({
      ...card,
      position: idx + 1,
    }));

    setCards(reOrdered);
    setEditItems(undefined);
    setShowForm(false);

    const payloadCards = reOrdered.map((card) => ({
      ...card,
      image: getFileNameFromUrl(card.image),
    }));

    sendCardsPayload(payloadCards);
  };

  const handleDeleteLink = (id: string) => {
    const updatedCards = cards
      .filter((card) => card.id !== id)
      .map((card, idx) => ({
        ...card,
        position: idx + 1,
      }));

    setCards(updatedCards);
    sendCardsPayload(updatedCards);
    //  Reset form if last item is deleted
    if (updatedCards.length === 0) {
      setShowForm(false);
      setEditItems(undefined);
    }
  };

  const handleSaveButton = (data: { url: string; text: string }) => {
    const updatedCTA = {
      cta_link: data.url ?? "",
      cta_text: data.text ?? "",
    };
    setCtaData(updatedCTA);

    const payload: {
      cta_link?: string;
      cta_text?: string;
      links?: CardItems[];
    } = {
      ...updatedCTA,
    };

    if (cards.length > 0) {
      // ✅ Strip image URLs to filenames only
      payload.links = cards.map((card) => ({
        ...card,
        image: getFileNameFromUrl(card.image),
      }));
    }

    onPayload({ linkouts: cards.length > 0 ? [payload] : null });
    setShowAddCTAForm(false);
  };

  const handleAddButtonToggle = (status: boolean) => {
    setAddToggle(status);
    // Show add CTA form when adding a new link
    if (status) {
      setShowAddCTAForm(true);
    }
    // Hide add CTA form when cta is not being added
    if (!status) {
      setShowAddCTAForm(false);
    }
    if (!status && hasCTA) {
      handleSaveButton({ text: "", url: "" });
    }
  };

  return (
    <Accordion
      className="gencl:w-full"
      collapsible
      type="single"
      onValueChange={handleAccordionToggle}
    >
      <AccordionItem
        className="gencl:border gencl:border-secondary-150 gencl:rounded-lg gencl:overflow-clip"
        value="item-1"
      >
        <AccordionTrigger className="gencl:text-lg gencl:font-semibold gencl:text-gray-800 gencl:py-2 gencl:px-4">
          <div className="gencl:flex gencl:justify-between gencl:w-full gencl:pr-2">
            <span className="gencl:flex gencl:items-center gencl:gap-3 gencl:text-body-1-semi-bold">
              <LinkIcon />
              Add link outs
            </span>
            {cards.length > 1 && (
              <span className="gencl:text-body-1-semi-bold">
                +{cards.length - 1}
              </span>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent className="gencl:bg-secondary-50 gencl:p-3 gencl:border-t gencl:border-secondary-150">
          <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-3 gencl:mb-3">
            {cards.map((item) => (
              <React.Fragment key={item.id}>
                <AddLinkCard
                  key={item.id}
                  item={item}
                  className={editItems?.id === item.id ? "gencl:hidden" : ""}
                  onEdit={() => {
                    setEditItems(item);
                    // Close new link add form and open edit form
                    setShowForm(false);
                  }}
                  onDelete={() => handleDeleteLink(item.id)}
                />
                {editItems?.id === item.id && (
                  <AddLinks
                    key={editItems?.id ?? ""}
                    url={editItems?.link ?? ""}
                    title={editItems?.title ?? ""}
                    image={editItems?.image ?? ""}
                    onCancel={() => setEditItems(undefined)}
                    onSubmit={handleSaveAddLink}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Only visible when adding a new link */}
          {showForm ? (
            <AddLinks
              url=""
              title=""
              image=""
              onCancel={() => {
                setShowForm(false);
                // Close link edit form and clear editItems state
                setEditItems(undefined);
              }}
              onSubmit={handleSaveAddLink}
            />
          ) : (
            <Button
              size="sm"
              theme="outline"
              className="gencl:w-full gencl:hover:bg-secondary-100"
              disabled={cards?.length >= MAX_LINKS}
              onClick={() => {
                setShowForm(true);
                setEditItems(undefined);
              }}
            >
              <Plus className="gencl:size-6" /> Add Link
            </Button>
          )}

          {/* CTA Button Section */}
          <div
            className={`gencl:flex gencl:justify-between gencl:items-center ${!showAddCTAForm ? "gencl:mt-4" : "gencl:my-4"}`}
          >
            <div className="gencl:flex gencl:items-center gencl:text-body-1-semi-bold">
              <Switch
                checked={addToggle}
                onCheckedChange={handleAddButtonToggle}
                disabled={cards.length === 0}
              />
              <label className="gencl:mx-2">Add Button</label>
            </div>
            {addToggle && !showAddCTAForm && (
              <Button
                size="sm"
                theme="custom"
                onClick={() => setShowAddCTAForm(true)}
              >
                Edit Button
              </Button>
            )}
          </div>

          {showAddCTAForm && (
            <AddButton
              onCancel={() => {
                setShowAddCTAForm(false);
                setCtaData({ ...ctaData });
                // Hide add CTA form when cta is not being added
                if (!ctaData.cta_link && !ctaData.cta_text) setAddToggle(false);
              }}
              onSubmit={handleSaveButton}
              button={{
                url: ctaData.cta_link,
                text: ctaData.cta_text,
              }}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
