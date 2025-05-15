import { formatFileSize } from "@/lib/file-utils"
import { cn } from "@/lib/utils"

describe("formatFileSize", () => {
  test("formats bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 Bytes")
    expect(formatFileSize(500)).toBe("500 Bytes")
    expect(formatFileSize(1023)).toBe("1023 Bytes")
  })

  test("formats kilobytes correctly", () => {
    expect(formatFileSize(1024)).toBe("1 KB")
    expect(formatFileSize(1536)).toBe("1.5 KB")
    expect(formatFileSize(10240)).toBe("10 KB")
  })

  test("formats megabytes correctly", () => {
    expect(formatFileSize(1048576)).toBe("1 MB")
    expect(formatFileSize(5242880)).toBe("5 MB")
  })

  test("formats gigabytes correctly", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB")
    expect(formatFileSize(10737418240)).toBe("10 GB")
  })
})

describe("cn utility", () => {
  test("combines class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2")
    expect(cn("class1", undefined, "class2")).toBe("class1 class2")
    expect(cn("class1", false && "class2")).toBe("class1")
    expect(cn("class1", true && "class2")).toBe("class1 class2")
  })

  test("handles conditional classes", () => {
    const isActive = true
    const isDisabled = false

    expect(cn("base", isActive && "active")).toBe("base active")
    expect(cn("base", isDisabled && "disabled")).toBe("base")
    expect(cn("base", isActive ? "active" : "inactive")).toBe("base active")
  })
})
