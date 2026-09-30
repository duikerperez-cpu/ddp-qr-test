import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
...
<div style={{ display: "flex" }}>
  <Sidebar />
  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
    <Topbar />
    <main style={{ padding: "18px" }}>{children}</main>
  </div>
</div>
