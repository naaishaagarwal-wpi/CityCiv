const supabaseUrl = "https://eucrnjfbbnpkhmslhlsx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Y3JuamZiYm5wa2htc2xobHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDczNDcsImV4cCI6MjA5MDAyMzM0N30.OZ4EJgTnKVcoxqnTuj4M8t27Ba_XU4Cbxv0bwRh7oiA";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("nameInput").value.trim();
  if (!email) return alert("Enter an email");

  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    alert("Login failed");
    console.error(error);
    return;
  }

  alert("Check your email for a login link!");
});