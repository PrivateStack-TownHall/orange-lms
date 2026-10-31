import React from "react";

import NotesList from "@/pages/notes";
import NotesCreate from "@/pages/notes/Create";
import NotesEdit from "@/pages/notes/Edit";
import NotesDetail from "@/pages/notes/Detail";

const noteRoutes = {
  path: "notes",

  children: [
    {
      index: true,
      element: <NotesList />,
    },
    {
      path: "create",
      element: <NotesCreate />,
    },
    {
      path: ":id",
      element: <NotesDetail />,
    },
    {
      path: "edit/:id",
      element: <NotesEdit />,
    },
  ],
};

export default noteRoutes;
