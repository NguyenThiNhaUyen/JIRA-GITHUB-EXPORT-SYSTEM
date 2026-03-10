import { useDroppable } from "@dnd-kit/core";

export default function CourseDropZone({ course, children }) {

  const { setNodeRef } = useDroppable({
    id: course.id
  });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}