const workload = useMemo(() => {

  const map = {};

  courses.forEach(course => {

    (course.lecturers || []).forEach(l => {

      if (!map[l.id]) {
        map[l.id] = {
          name: l.name,
          courses: []
        };
      }

      map[l.id].courses.push(course);

    });

  });

  return map;

}, [courses]);