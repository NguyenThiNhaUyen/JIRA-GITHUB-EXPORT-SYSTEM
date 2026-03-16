import { useDraggable } from "@dnd-kit/core";

export default function LecturerCard({ lecturer }) {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lecturer.id
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-3 bg-white border rounded-xl shadow-sm cursor-grab hover:bg-gray-50"
    >
      {lecturer.name}
    </div>
  );
}